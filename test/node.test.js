const assert = require('assert');
const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');
assert.strictEqual(pkg.name, 'n8n-nodes-aeorank');
assert.ok(pkg.keywords.includes('n8n-community-node-package'), 'Missing n8n-community-node-package keyword');
assert.deepStrictEqual(pkg.dependencies, {}, 'Runtime dependencies must be empty for n8n verification');

const { AeoRankApi } = require('../dist/credentials/AeoRankApi.credentials.js');
const cred = new AeoRankApi();
assert.strictEqual(cred.name, 'aeoRankApi');
assert.strictEqual(cred.properties[0].default, 'demo');

const { AeoRank } = require('../dist/nodes/AeoRank/AeoRank.node.js');
const node = new AeoRank();
assert.strictEqual(node.description.name, 'aeoRank');
assert.strictEqual(node.description.usableAsTool, true, 'Node must have usableAsTool: true for n8n AI Agents');
assert.ok(fs.existsSync(path.join(__dirname, '..', 'dist', 'nodes', 'AeoRank', 'aeorank.svg')), 'Missing SVG icon in dist');
assert.ok(fs.existsSync(path.join(__dirname, '..', 'dist', 'nodes', 'AeoRank', 'AeoRank.node.json')), 'Missing codex JSON in dist');

const codex = require('../dist/nodes/AeoRank/AeoRank.node.json');
assert.deepStrictEqual(codex.alias, ['AeoRank'], 'Codex aliases must only name AeoRank');

// Verify operation names, actions, and descriptions do not carry promotional/sales copy or credit pricing
const opProps = node.description.properties.filter(p => p.name === 'operation');
for (const prop of opProps) {
  for (const op of prop.options) {
    assert.ok(!/\(.*Credit|Keyless|free trial|\$0/i.test(op.name), `Operation name must not contain promotional/pricing text: ${op.name}`);
    assert.ok(!/\(.*Credit|Keyless|free trial|\$0/i.test(op.action || ''), `Operation action must not contain promotional/pricing text: ${op.action}`);
    assert.ok(!/\(.*Credit|Keyless|free trial|\$0/i.test(op.description || ''), `Operation description must not contain promotional/pricing text: ${op.description}`);
  }
}
const topLangProp = node.description.properties.find(p => p.name === 'lang');
assert.strictEqual(topLangProp, undefined, 'Optional lang parameter must not be at the top level');
const addFieldsProp = node.description.properties.find(p => p.name === 'additionalFields');
assert.ok(addFieldsProp && addFieldsProp.type === 'collection', 'additionalFields collection must exist');

(async () => {
  const capturedCalls = [];
  const mockContext = {
    getInputData: () => [{ json: {} }],
    getCredentials: async () => ({ apiKey: 'demo', baseUrl: 'https://aeorank.app/' }),
    getNodeParameter: (name) => {
      const map = { resource: 'audit', operation: 'sandboxAudit', url: 'https://aeorank.app', additionalFields: { lang: 'en' } };
      return map[name];
    },
    continueOnFail: () => false,
    getNode: () => ({ name: 'AEORank' }),
    helpers: {
      httpRequestWithAuthentication: async function (credName, options) {
        capturedCalls.push({ credName, options });
        return { ok: true, sandbox: true, overall: 100 };
      },
    },
  };
  const out = await node.execute.call(mockContext);
  assert.strictEqual(out.length, 1);
  assert.strictEqual(out[0][0].json.overall, 100);
  assert.strictEqual(capturedCalls[0].credName, 'aeoRankApi');
  assert.strictEqual(capturedCalls[0].options.url, 'https://aeorank.app/api/v1/audit/sandbox');

  // Verify patchPack uses REST endpoint /api/v1/patch-pack (not /mcp)
  const mockPatchContext = {
    ...mockContext,
    getNodeParameter: (name) => {
      const map = { resource: 'patchPack', operation: 'generatePatchPack', url: 'https://aeorank.app', additionalFields: { lang: 'vi' } };
      return map[name];
    },
  };
  await node.execute.call(mockPatchContext);
  assert.strictEqual(capturedCalls[1].options.url, 'https://aeorank.app/api/v1/patch-pack');
  assert.deepStrictEqual(capturedCalls[1].options.body, { url: 'https://aeorank.app', lang: 'vi' });
  console.log('ALL n8n-nodes-aeorank checks passed.');
})();
