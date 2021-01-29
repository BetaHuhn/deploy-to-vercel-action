const core = require('@actions/core')
const github = require('@actions/github')
require('dotenv').config()

const getVar = ({ key, default: dft, required = false, type = 'string' }) => {
	// TODO: Fix parsing GH TOKEN
	const coreVar = Array.isArray(key) ? key.find((item) => core.getInput(item) ? core.getInput(item) : undefined) : core.getInput(key)
	const envVar = Array.isArray(key) ? key.find((item) => process.env[item]) : process.env[key]

	if (coreVar !== undefined && coreVar.length >= 1) {
		if (type === 'array') return coreVar.split('\n')

		return coreVar
	}

	if (envVar !== undefined && envVar.length >= 1) {
		if (type === 'array') return envVar.split(',')
		if (type === 'boolean') return envVar === 'true'

		return envVar
	}

	if (required === true)
		return core.setFailed(`Variable ${ key } missing.`)

	return dft

}

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
	DEPLOY_PRS: getVar({
		key: 'DEPLOY_PRS',
		type: 'boolean',
		default: true
	}),
	GITHUB_DEPLOYMENT: getVar({
		key: 'GITHUB_DEPLOYMENT',
		type: 'boolean',
		default: true
	}),
	VERCEL_SCOPE: getVar({
		key: 'VERCEL_SCOPE'
	}),
	VERCEL_ALIAS_DOMAINS: getVar({
		key: 'VERCEL_ALIAS_DOMAINS',
		type: 'array'
	}),
	GITHUB_REPOSITORY: getVar({
		key: 'GITHUB_REPOSITORY',
		required: true
	})
}

context.IS_PR = github.context.eventName === 'pull_request'
context.RUNNING_LOCAL = process.env.RUNNING_LOCAL === 'true'
context.BRANCH = (() => {
	if (process.env.RUNNING_LOCAL === 'true') return 'master'
	return context.IS_PR ? github.event.pull_request.head.ref : github.event.ref.substr(11)
})()

context.USER = context.GITHUB_REPOSITORY.split('/')[0]
context.REPOSITORY = context.GITHUB_REPOSITORY.split('/')[1]

if (context.IS_PR) {
	context.PR_NUMBER = github.event.number
}

core.setSecret(context.GITHUB_TOKEN)

core.debug(
	JSON.stringify(
		context,
		null,
		2
	)
)

module.exports = context