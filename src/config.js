const core = require('@actions/core')
const github = require('@actions/github')
require('dotenv').config()

const getVar = ({ key, default: dft, required = false, type = 'string' }) => {
	let coreVar
	if (Array.isArray(key)) {
		key.forEach((item) => {
			if (core.getInput(item)) {
				coreVar = core.getInput(item)
			}
		})
	} else {
		coreVar = core.getInput(key)
	}

	let envVar
	if (Array.isArray(key)) {
		key.forEach((item) => {
			if (item in process.env) {
				envVar = process.env[item]
			}
		})
	} else {
		envVar = process.env[key]
	}

	if (key === 'PR_LABELS' && (coreVar === false || envVar === 'false'))
		return undefined

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
	PR_LABELS: getVar({
		key: 'PR_LABELS',
		default: [ 'deployed' ],
		type: 'array'
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
	}),
	IS_PR: github.context.eventName === 'pull_request',
	RUNNING_LOCAL: process.env.RUNNING_LOCAL === 'true'
}

const setDynamicVars = () => {
	if (context.IS_PR === true && context.DEPLOY_PRS === false)
		core.setFailed(`Exiting, because "DEPLOY_PRS" option is set to false and Action was triggered from PR`)

	context.USER = context.GITHUB_REPOSITORY.split('/')[0]
	context.REPOSITORY = context.GITHUB_REPOSITORY.split('/')[1]
	context.SHA = context.RUNNING_LOCAL ? '' : github.context.sha

	if (context.IS_PR) {
		context.PR_NUMBER = github.context.payload.number
		context.REF = context.RUNNING_LOCAL ? 'refs/heads/master' : github.context.payload.pull_request.head.ref
	} else {
		context.REF = context.RUNNING_LOCAL ? 'refs/heads/master' : github.context.ref
	}

	context.LOG_URL = context.IS_PR ? `https://github.com/${ context.USER }/${ context.REPOSITORY }/pull/${ context.PR_NUMBER }/checks` : `https://github.com/${ context.USER }/${ context.REPOSITORY }/commit/${ context.SHA }/checks`
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