const core = require('@actions/core')

require('dotenv').config()

const getVar = ({ key, default: dft, required = false, type = 'string' }) => {
	const coreVar = Array.isArray(key) ? key.find((item) => core.getInput(item)) : core.getInput(key)
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
	GITHUB_DEPLOYMENT: getVar({
		key: 'GITHUB_DEPLOYMENT',
		type: 'boolean',
		default: true
	}),
	GITHUB_COMMENT: getVar({
		key: 'GITHUB_COMMENT',
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

core.setSecret(context.GITHUB_TOKEN)

core.debug(
	JSON.stringify(
		context,
		null,
		2
	)
)

module.exports = context