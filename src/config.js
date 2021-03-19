const core = require('@actions/core')
const github = require('@actions/github')
require('dotenv').config()

const { getVar } = require('./helpers')

const context = {
	GITHUB_TOKEN: getVar({
		key: [ 'GH_PAT', 'GITHUB_TOKEN' ],
		required: true
	}),
	VERCEL_TOKEN: getVar({
		key: 'VERCEL_TOKEN',
		required: true
	}),
	VERCEL_ORG_ID: getVar({
		key: 'VERCEL_ORG_ID',
		required: true
	}),
	VERCEL_PROJECT_ID: getVar({
		key: 'VERCEL_PROJECT_ID',
		required: true
	}),
	PRODUCTION: getVar({
		key: 'PRODUCTION',
		type: 'boolean',
		default: true
	}),
	GITHUB_DEPLOYMENT: getVar({
		key: 'GITHUB_DEPLOYMENT',
		type: 'boolean',
		default: true
	}),
	DELETE_EXISTING_COMMENT: getVar({
		key: 'DELETE_EXISTING_COMMENT',
		type: 'boolean',
		default: true
	}),
	ATTACH_COMMIT_METADATA: getVar({
		key: 'ATTACH_COMMIT_METADATA',
		type: 'boolean',
		default: true
	}),
	DEPLOY_PR_FROM_FORK: getVar({
		key: 'DEPLOY_PR_FROM_FORK',
		type: 'boolean',
		default: false
	}),
	PR_LABELS: getVar({
		key: 'PR_LABELS',
		default: [ 'deployed' ],
		type: 'array'
	}),
	ALIAS_DOMAINS: getVar({
		key: 'ALIAS_DOMAINS',
		type: 'array'
	}),
	PR_PREVIEW_DOMAIN: getVar({
		key: 'PR_PREVIEW_DOMAIN'
	}),
	VERCEL_SCOPE: getVar({
		key: 'VERCEL_SCOPE'
	}),
	GITHUB_REPOSITORY: getVar({
		key: 'GITHUB_REPOSITORY',
		required: true
	}),
	RUNNING_LOCAL: process.env.RUNNING_LOCAL === 'true'
}

const setDynamicVars = () => {
	context.USER = context.GITHUB_REPOSITORY.split('/')[0]
	context.REPOSITORY = context.GITHUB_REPOSITORY.split('/')[1]

	// If running the action locally, use env vars instead of github.context
	if (context.RUNNING_LOCAL) {
		context.SHA = process.env.SHA || 'XXXXXXX'
		context.IS_PR = process.env.IS_PR === 'true' || false
		context.PR_NUMBER = process.env.PR_NUMBER || undefined
		context.REF = process.env.REF || 'refs/heads/master'
		context.BRANCH = process.env.BRANCH || 'master'
		context.PRODUCTION = process.env.PRODUCTION === 'true' || !context.IS_PR
		context.LOG_URL = process.env.LOG_URL || `https://github.com/${ context.USER }/${ context.REPOSITORY }`
		context.ACTOR = process.env.ACTOR || context.USER
		context.IS_FORK = process.env.IS_FORK === 'true' || false

		return
	}

	context.IS_PR = [ 'pull_request', 'pull_request_target' ].includes(github.context.eventName)
	context.SHA = github.context.sha
	context.ACTOR = github.context.actor

	// Use different values depending on if the Action was triggered by a PR
	if (context.IS_PR) {
		context.PRODUCTION = false
		context.PR_NUMBER = github.context.payload.number
		context.REF = github.context.payload.pull_request.head.ref
		context.BRANCH = github.context.payload.pull_request.head.ref
		context.LOG_URL = `https://github.com/${ context.USER }/${ context.REPOSITORY }/pull/${ context.PR_NUMBER }/checks`
		context.IS_FORK = github.context.payload.pull_request.head.repo.full_name !== context.GITHUB_REPOSITORY
	} else {
		context.REF = github.context.ref
		context.BRANCH = github.context.ref.substr(11)
		context.LOG_URL = `https://github.com/${ context.USER }/${ context.REPOSITORY }/commit/${ context.SHA }/checks`
	}
}

setDynamicVars()

core.setSecret(context.GITHUB_TOKEN)
core.setSecret(context.VERCEL_TOKEN)

core.debug(
	JSON.stringify(
		context,
		null,
		2
	)
)

module.exports = context