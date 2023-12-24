const core = require('@actions/core')
const github = require('@actions/github')
require('dotenv').config()

const IS_PR = [ 'pull_request', 'pull_request_target' ].includes(github.context.eventName)

const context = {
	GITHUB_TOKEN: core.getInput('GITHUB_TOKEN', { required: true }),
	VERCEL_TOKEN: core.getInput('VERCEL_TOKEN', { required: true }),
	VERCEL_ORG_ID: core.getInput('VERCEL_ORG_ID', { required: true }),
	VERCEL_PROJECT_ID: core.getInput('VERCEL_PROJECT_ID', { required: true }),
	PRODUCTION: core.getInput('PRODUCTION') !== 'false',
	GITHUB_DEPLOYMENT: core.getInput('GITHUB_DEPLOYMENT') !== 'false',
	CREATE_COMMENT: core.getInput('CREATE_COMMENT') !== 'false',
	DELETE_EXISTING_COMMENT: core.getInput('DELETE_EXISTING_COMMENT') !== 'false',
	ATTACH_COMMIT_METADATA: core.getInput('ATTACH_COMMIT_METADATA') !== 'false',
	DEPLOY_PR_FROM_FORK: core.getInput('DEPLOY_PR_FROM_FORK') !== 'false',
	PR_LABELS: core.getInput('PR_LABELS') ? core.getInput('PR_LABELS').split(',') : [ 'deployed' ],
	ALIAS_DOMAINS: core.getInput('ALIAS_DOMAINS') ? core.getInput('ALIAS_DOMAINS').split(',') : [],
	PR_PREVIEW_DOMAIN: core.getInput('PR_PREVIEW_DOMAIN'),
	VERCEL_SCOPE: core.getInput('VERCEL_SCOPE'),
	GITHUB_REPOSITORY: core.getInput('GITHUB_REPOSITORY', { required: true }),
	GITHUB_DEPLOYMENT_ENV: core.getInput('GITHUB_DEPLOYMENT_ENV'),
	TRIM_COMMIT_MESSAGE: core.getInput('TRIM_COMMIT_MESSAGE') !== 'false',
	WORKING_DIRECTORY: core.getInput('WORKING_DIRECTORY'),
	BUILD_ENV: core.getInput('BUILD_ENV') ? core.getInput('BUILD_ENV').split(',') : [],
	PREBUILT: core.getInput('PREBUILT') !== 'false',
	RUNNING_LOCAL: process.env.RUNNING_LOCAL === 'true',
	FORCE: core.getInput('FORCE') !== 'false'
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
		context.TRIM_COMMIT_MESSAGE = process.env.TRIM_COMMIT_MESSAGE === 'true' || false

		return
	}

	context.IS_PR = IS_PR
	context.LOG_URL = `https://github.com/${ context.USER }/${ context.REPOSITORY }/actions/runs/${ process.env.GITHUB_RUN_ID }`

	// Use different values depending on if the Action was triggered by a PR
	if (context.IS_PR) {
		context.PR_NUMBER = github.context.payload.number
		context.ACTOR = github.context.payload.pull_request.user.login
		context.REF = github.context.payload.pull_request.head.ref
		context.SHA = github.context.payload.pull_request.head.sha
		context.BRANCH = github.context.payload.pull_request.head.ref
		context.IS_FORK = github.context.payload.pull_request.head.repo.full_name !== context.GITHUB_REPOSITORY
	} else {
		context.ACTOR = github.context.actor
		context.REF = github.context.ref
		context.SHA = github.context.sha
		context.BRANCH = github.context.ref.substr(11)
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