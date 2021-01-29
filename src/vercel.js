const core = require('@actions/core')
const { exec } = require('./helpers')

const {
	VERCEL_TOKEN,
	PRODUCTION,
	VERCEL_SCOPE,
	VERCEL_ORG_ID,
	VERCEL_PROJECT_ID
} = require('./config')

const setEnv = async () => {
	core.exportVariable('VERCEL_ORG_ID', VERCEL_ORG_ID)
	core.exportVariable('VERCEL_PROJECT_ID', VERCEL_PROJECT_ID)
}

const deploy = async () => {
	let command = `vercel -t ${ VERCEL_TOKEN }`

	if (VERCEL_SCOPE) {
		command += ` --scope ${ VERCEL_SCOPE }`
	}

	if (PRODUCTION) {
		command += ` --prod`
	}

	const output = await exec(command)

	return output
}

module.exports = {
	deploy,
	setEnv
}