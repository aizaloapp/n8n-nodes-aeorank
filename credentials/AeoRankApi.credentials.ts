import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class AeoRankApi implements ICredentialType {
	name = 'aeoRankApi';
	displayName = 'AEORank API';
	documentationUrl = 'https://aeorank.app/learn';
	icon: Icon = {
		light: 'file:aeorank.svg',
		dark: 'file:aeorank.dark.svg',
	};

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: 'demo',
			description:
				'Enter your AEORank API key (or "demo" for sandbox testing) to authenticate requests.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://aeorank.app',
			description: 'AEORank API Gateway URL.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'User-Agent': 'n8n-nodes-aeorank/1.0.4 (+https://aeorank.app)',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v1/rules?lang=en',
			method: 'GET',
		},
	};
}
