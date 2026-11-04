# n8n-nodes-aeorank — Official AEORank SEO, AEO & GEO Node for n8n & AI Agents

[![npm version](https://img.shields.io/npm/v/n8n-nodes-aeorank.svg)](https://www.npmjs.com/package/n8n-nodes-aeorank)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://github.com/aizaloapp/n8n-nodes-aeorank/blob/main/LICENSE)
[![AEORank Standard](https://img.shields.io/badge/Standard-AEORank%20GEO--62-10b981)](https://aeorank.app)

**`n8n-nodes-aeorank`** is the official [n8n](https://n8n.io) community node and **AI Agent Tool (`usableAsTool: true`)** for **[AEORank](https://aeorank.app)** — the live 62-rule Technical SEO, Answer Engine Optimization (AEO), and Generative Engine Optimization (GEO) diagnostic platform.

Automate post-publish SEO/GEO quality gates, verify AI citation readiness across **ChatGPT Search, Perplexity, Google AI Overviews & Gemini**, and generate ready-to-deploy **`/llms.txt`**, **RFC 9309 `robots.txt`**, **Schema.org JSON-LD**, **A2A `agent-card.json`**, and **SEP-1649 MCP Server Cards** directly inside your n8n workflows or n8n AI Agents.

---

## ✨ Key Features

- **Zero Runtime Dependencies (`"dependencies": {}`):** Built strictly on native `n8n-workflow` helpers (`httpRequestWithAuthentication`) for n8n Cloud & self-hosted verification compliance.
- **Instant `$0` Testing (`Bearer demo`):** Pre-configured with the `demo` API key out of the box so you can test credentials and run live trial/sandbox audits immediately without purchasing credits first.
- **n8n AI Agent Tool Ready (`usableAsTool: true`):** Attach **AEORank** directly as a tool to any **n8n AI Agent** node so your LLM agent can inspect live URLs, diagnose `P1`/`P2`/`P3` blockers, and generate `llms.txt` patch packs autonomously.
- **Published with SLSA npm Provenance:** Built and attested via GitHub Actions (`npm publish --provenance`).

---

## 📦 Installation

### In n8n GUI (Community Nodes)
1. Open your n8n instance and go to **Settings > Community Nodes**.
2. Click **Install a community node**.
3. Enter **`n8n-nodes-aeorank`** and click **Install**.

### With npx (Quick Local Demo)
```bash
npx n8n
```

---

## 🛠️ Supported Resources & Operations

### 1. Resource: `Audit`
| Operation | Endpoint | Credits | Description |
| :--- | :--- | :--- | :--- |
| **Scan Homepage and Sitemap** | `POST /api/trial-scan` | `$0` (`demo`) | Live 62-rule homepage & sitemap diagnostic scan returning overall score, grade, 9 pillar `area_lights`, `entity_gap`, and `/llms.txt` draft. |
| **Run Sandbox Audit** | `POST /api/v1/audit/sandbox` | `0 credits` | Instant `< 10ms` deterministic v2 schema diagnostic payload for testing pipelines. |
| **Run Technical Audit** | `POST /api/v1/audit/technical` | `1 credit` | Commercial API v1 56-rule single-page + 6-rule sitemap + Knowledge Graph `sameAs` Entity Gap + `/llms.txt` draft (`aeo_live_*`). |
| **Run Full GEO & 2-AI Citation Audit** | `POST /api/v1/audit/full` | `5 credits` | Full Technical + `AEO-Sem` Semantic Engine (14 dimensions) + Live 2-AI Citation probe on Perplexity & Google AI Mode (`aeo_live_*`). |

### 2. Resource: `Agent Patch Pack`
| Operation | Endpoint | Description |
| :--- | :--- | :--- |
| **Generate 5-Tab Patch Pack** | `POST /api/v1/patch-pack` | Generates ready-to-deploy `llms.txt`, additive RFC 9309 `robots.txt` (`Content-Signal`), escaped `Schema.org JSON-LD`, `/.well-known/agent-card.json` (A2A), and `/.well-known/mcp/server-card.json` (SEP-1649). |

### 3. Resource: `Reference & Drift Guard`
| Operation | Endpoint | Description |
| :--- | :--- | :--- |
| **Get GEO-62 Rules Catalog** | `GET /api/v1/rules` | Fetch all 62 deterministic rule codes (`AEO-001`..`AEO-054`, `PFA-01`, `CFA-02`) and 9 normalized pillar weights (`$0`). |
| **Trigger Drift Guard Rescan** | `POST /api/dashboard/rescan` | Trigger an on-demand Weekly Drift Guard rescan for a monitored domain using a scoped `aeo_sync_*` token. |

---

## 🚀 Usage Example & Sample Output

### Example 1: Auditing a Website & Alerting Slack on Regressions

1. Add a **Schedule Trigger** node (e.g., every Monday at 09:00).
2. Add the **AEORank** node with the following parameters:
   - **Credential to connect with:** `AEORank API` (keep default API Key `demo` for free trial/sandbox testing, or `aeo_live_...` for production)
   - **Resource:** `Audit`
   - **Operation:** `Scan Homepage and Sitemap` (or `Run Sandbox Audit`)
   - **Target URL:** `https://aeorank.app`
   - **Additional Fields > Language:** `English (EN)`
3. Connect an **IF** node checking whether `{{ $json.trial.overall }}` is less than `80` or `{{ $json.trial.counts.critical }}` is greater than `0`.
4. Connect a **Slack** node to post the score, grade, and top `teaser_actions` remediation steps to your `#seo-engineering` channel.

#### Sample JSON Output (`Run Sandbox Audit` / `Scan Homepage and Sitemap`)

```json
{
  "ok": true,
  "sandbox": true,
  "scan_token": "sandbox_demo_token_aeorank",
  "order_code": "GRSANDBOX",
  "trial": {
    "schema_version": 2,
    "lang": "en",
    "domain": "example.com",
    "start_url": "https://example.com/",
    "status": 200,
    "overall": 82,
    "grade": "Good",
    "counts": {
      "total": 4,
      "critical": 0,
      "high": 1,
      "medium": 2,
      "low": 1
    },
    "ai_bots_allowed_count": 10,
    "ai_bots_total": 10,
    "llms_txt_exists": false,
    "agentic_readiness": {
      "score": 1,
      "max_score": 6,
      "label": "1/6"
    },
    "teaser_actions": [
      {
        "id": "AEO-001",
        "rule_id": "llms_txt_missing",
        "category": "ai_search",
        "severity": "medium",
        "priority": "P2",
        "title": "Missing /llms.txt context file for AI models",
        "remediation": "Create a Markdown /llms.txt file summarizing core products, services, and canonical URLs."
      }
    ]
  }
}
```

### Example 2: Generating a 5-Tab Agent Patch Pack (`POST /api/v1/patch-pack`)

- **Resource:** `Agent Patch Pack`
- **Operation:** `Generate 5-Tab Patch Pack`
- **Target URL:** `https://aeorank.app`
- **Additional Fields > Language:** `English (EN)`

Returns `patch_pack` containing ready-to-save files (`llms_txt`, `robots_txt`, `schema_jsonld`, `agent_card_json`, `mcp_server_card_json`) plus an `agent_prompt` string ready to pass to an downstream LLM or GitHub Pull Request node.

---

## 🔐 Credentials Setup (`AEORank API`)

1. Create a new **AEORank API** credential in n8n.
2. Leave **API Key** as **`demo`** to test immediately for free (supports **Test Credential**, **Run Free Trial Scan**, **Run Sandbox Audit**, **Generate 5-Tab Patch Pack**, and **Get GEO-62 Rules Catalog**).
3. For production CI/CD & live 2-AI citation audits, get a commercial API key (`aeo_live_...`) or Drift Guard sync token (`aeo_sync_...`) at **[https://aeorank.app/pricing](https://aeorank.app/pricing)**.

---

## 🌐 Official AEORank Ecosystem & Documentation

- **Live Web Application & Instant Scanner:** [https://aeorank.app](https://aeorank.app)
- **GEO-62 Engineering Knowledge Hub:** [https://aeorank.app/learn](https://aeorank.app/learn)
- **Pricing & Commercial API v1:** [https://aeorank.app/pricing](https://aeorank.app/pricing)
- **OpenAPI 3.0.3 Specification:** [https://aeorank.app/openapi.json](https://aeorank.app/openapi.json)
- **Terminal CLI & Stdio MCP Server (`npx aeorank-geo`):** [https://www.npmjs.com/package/aeorank-geo](https://www.npmjs.com/package/aeorank-geo)
- **Open Standard & Spec Repository:** [https://github.com/aizaloapp/aeorank](https://github.com/aizaloapp/aeorank)
- **Privacy Policy:** [https://aeorank.app/privacy](https://aeorank.app/privacy)

## License

MIT © [AEORank Engineering](https://aeorank.app)
