import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeConnectionType,
} from 'n8n-workflow';

export class AeoRank implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AEORank',
		name: 'aeoRank',
		icon: {
			light: 'file:aeorank.svg',
			dark: 'file:aeorank.dark.svg',
		},
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description:
			'Live 62-Rule SEO, AEO & GEO Diagnostics, AI Share of Voice, and 5-Tab Agent Patch Pack Generator (https://aeorank.app)',
		defaults: {
			name: 'AEORank',
		},
		inputs: ['main'] as NodeConnectionType[],
		outputs: ['main'] as NodeConnectionType[],
		usableAsTool: true,
		credentials: [
			{
				name: 'aeoRankApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Audit',
						value: 'audit',
						description: 'Run deterministic 62-rule SEO, AEO & GEO diagnostics on any URL',
					},
					{
						name: 'Agent Patch Pack',
						value: 'patchPack',
						description:
							'Generate ready-to-deploy llms.txt, RFC 9309 robots.txt, JSON-LD, A2A Agent Card & MCP Server Card',
					},
					{
						name: 'Reference & Drift Guard',
						value: 'reference',
						description: 'Query GEO-62 rule specifications or trigger an on-demand Drift Guard rescan',
					},
				],
				default: 'audit',
			},
			// ----------------------------------
			// Resource: Audit
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['audit'],
					},
				},
				options: [
					{
						name: 'Scan Homepage and Sitemap',
						value: 'trialScan',
						description:
							'Execute a live 62-rule homepage and sitemap diagnostic scan',
						action: 'Scan homepage and sitemap',
					},
					{
						name: 'Run Sandbox Audit',
						value: 'sandboxAudit',
						description:
							'Return a deterministic v2 schema diagnostic payload for testing workflows',
						action: 'Run sandbox audit',
					},
					{
						name: 'Run Technical Audit',
						value: 'technicalAudit',
						description:
							'Execute a live 56-rule homepage, 6-rule sitemap, Entity Gap, and llms.txt technical audit',
						action: 'Run technical audit',
					},
					{
						name: 'Run Full GEO & 2-AI Citation Audit',
						value: 'fullAudit',
						description:
							'Execute a full technical audit, semantic evaluation, and live AI citation check',
						action: 'Run full citation audit',
					},
				],
				default: 'trialScan',
			},
			// ----------------------------------
			// Resource: Agent Patch Pack
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['patchPack'],
					},
				},
				options: [
					{
						name: 'Generate 5-Tab Patch Pack',
						value: 'generatePatchPack',
						description:
							'Generate ready-to-deploy llms.txt, RFC 9309 robots.txt, JSON-LD, A2A Agent Card & MCP Server Card',
						action: 'Generate agent patch pack',
					},
				],
				default: 'generatePatchPack',
			},
			// ----------------------------------
			// Resource: Reference & Drift Guard
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['reference'],
					},
				},
				options: [
					{
						name: 'Get GEO-62 Rules Catalog',
						value: 'getRules',
						description:
							'Retrieve the 62-rule SEO, AEO, and GEO specification and normalized pillar weights',
						action: 'Get rules catalog',
					},
					{
						name: 'Trigger Drift Guard Rescan',
						value: 'triggerRescan',
						description:
							'Trigger an on-demand Drift Guard rescan for a monitored domain',
						action: 'Trigger domain rescan',
					},
				],
				default: 'getRules',
			},
			// ----------------------------------
			// Shared Parameters
			// ----------------------------------
			{
				displayName: 'Target URL',
				name: 'url',
				type: 'string',
				required: true,
				default: 'https://aeorank.app',
				placeholder: 'https://example.com',
				description: 'Public website URL to audit or generate an Agent Patch Pack for',
				displayOptions: {
					show: {
						resource: ['audit', 'patchPack'],
					},
				},
			},
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				required: true,
				default: 'aeorank.app',
				placeholder: 'example.com',
				description: 'Monitored domain in AEORank Drift Guard Dashboard',
				displayOptions: {
					show: {
						resource: ['reference'],
						operation: ['triggerRescan'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				options: [
					{
						displayName: 'Language',
						name: 'lang',
						type: 'options',
						options: [
							{
								name: 'English (EN)',
								value: 'en',
							},
							{
								name: 'Vietnamese (VI)',
								value: 'vi',
							},
						],
						default: 'en',
						description: 'Output language for rule labels, remediations, and diagnostics',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('aeoRankApi');
		const baseUrl = String(credentials.baseUrl || 'https://aeorank.app').replace(/\/+$/, '');

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
				const lang = (additionalFields.lang as string) || 'en';

				let method: IHttpRequestMethods = 'POST';
				let endpoint = '/api/trial-scan';
				let body: Record<string, unknown> | undefined;
				let qs: Record<string, string> | undefined;

				if (resource === 'audit') {
					const url = this.getNodeParameter('url', i) as string;
					body = { url, lang };
					if (operation === 'trialScan') {
						endpoint = '/api/trial-scan';
					} else if (operation === 'sandboxAudit') {
						endpoint = '/api/v1/audit/sandbox';
					} else if (operation === 'technicalAudit') {
						endpoint = '/api/v1/audit/technical';
					} else if (operation === 'fullAudit') {
						endpoint = '/api/v1/audit/full';
					}
				} else if (resource === 'patchPack') {
					const url = this.getNodeParameter('url', i) as string;
					method = 'POST';
					endpoint = '/api/v1/patch-pack';
					body = { url, lang };
				} else if (resource === 'reference') {
					if (operation === 'getRules') {
						method = 'GET';
						endpoint = '/api/v1/rules';
						qs = { lang };
					} else if (operation === 'triggerRescan') {
						const domain = this.getNodeParameter('domain', i) as string;
						method = 'POST';
						endpoint = '/api/dashboard/rescan';
						body = { domain, lang };
					}
				}

				const options: IHttpRequestOptions = {
					method,
					url: `${baseUrl}${endpoint}`,
					qs,
					body,
					json: true,
				};

				const responseData = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'aeoRankApi',
					options,
				);

				returnData.push({
					json: responseData,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), error as any, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
