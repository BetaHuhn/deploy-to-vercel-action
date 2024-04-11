const core = require('@actions/core')
const github = require('@actions/github')

const IS_PR = [ 'pull_request', 'pull_request_target' ].includes(github.context.eventName)

const context = {
	GITHUB_TOKEN: core.getInput('GITHUB_TOKEN', { required: true }),
	VERCEL_TOKEN: core.getInput('VERCEL_TOKEN', { required: true }),
	VERCEL_ORG_ID: core.getInput('VERCEL_ORG_ID', { required: true }),
	VERCEL_PROJECT_ID: core.getInput('VERCEL_PROJECT_ID', { required: true }),
	PRODUCTION: core.getBooleanInput('PRODUCTION', { required: false }),
	GITHUB_DEPLOYMENT: core.getBooleanInput('GITHUB_DEPLOYMENT', { required: false }),
	CREATE_COMMENT: core.getBooleanInput('CREATE_COMMENT', { required: false }),
	DELETE_EXISTING_COMMENT: core.getBooleanInput('DELETE_EXISTING_COMMENT', { required: false }),
	ATTACH_COMMIT_METADATA: core.getBooleanInput('ATTACH_COMMIT_METADATA', { required: false }),
	DEPLOY_PR_FROM_FORK: core.getBooleanInput('DEPLOY_PR_FROM_FORK', { required: false }),
	PR_LABELS: core.getMultilineInput('PR_LABELS', { required: false }),
	ALIAS_DOMAINS: core.getMultilineInput('ALIAS_DOMAINS', { required: false }),
	PR_PREVIEW_DOMAIN: core.getInput('PR_PREVIEW_DOMAIN'),
	VERCEL_SCOPE: core.getInput('VERCEL_SCOPE'),
	GITHUB_DEPLOYMENT_ENV: core.getInput('GITHUB_DEPLOYMENT_ENV'),
	TRIM_COMMIT_MESSAGE: core.getBooleanInput('TRIM_COMMIT_MESSAGE', { required: false }),
	WORKING_DIRECTORY: core.getInput('WORKING_DIRECTORY'),
	BUILD_ENV: core.getMultilineInput('BUILD_ENV', { required: false }),
	RUNTIME_ENV: core.getMultilineInput('RUNTIME_ENV', { required: false }),
	PREBUILT: core.getBooleanInput('PREBUILT', { required: false }),
	RUNNING_LOCAL: process.env.RUNNING_LOCAL === 'true',
	FORCE: core.getBooleanInput('FORCE', { required: false })
}

const setDynamicVars = () => {
	const { owner, repo } = github.context.repo
	context.USER = owner
	context.REPOSITORY = repo

	// If running the action locally, use env vars instead of github.context
	if (context.RUNNING_LOCAL) {
		context.SHA = process.env.SHA || 'XXXXXXX'
		context.IS_PR = process.env.IS_PR === 'true' || false
		context.PR_NUMBER = process.env.PR_NUMBER || undefined
		context.REF = process.env.REF || 'refs/heads/master'
		context.BRANCH = process.env.BRANCH || 'master'
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
		context.IS_FORK = github.context.payload.pull_request.head.repo.full_name !== process.env.GITHUB_REPOSITORY
	} else {
		context.ACTOR = github.context.actor
		context.REF = github.context.ref
		context.SHA = github.context.sha
		context.BRANCH = github.context.ref.substring('refs/heads/'.length)
	}
}

setDynamicVars()

core.setSecret(context.GITHUB_TOKEN)
core.setSecret(context.VERCEL_TOKEN)

core.debug(
	JSON.stringify(context)
)

module.exports = context