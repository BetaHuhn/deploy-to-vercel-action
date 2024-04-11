const core = require('@actions/core')
const { execCmd, removeSchema } = require('./helpers')

const {
	VERCEL_TOKEN,
	PRODUCTION,
	VERCEL_SCOPE,
	VERCEL_ORG_ID,
	VERCEL_PROJECT_ID,
	SHA,
	USER,
	REPOSITORY,
	BRANCH,
	TRIM_COMMIT_MESSAGE,
	BUILD_ENV,
	PREBUILT,
	WORKING_DIRECTORY,
	FORCE,
	GITHUB_DEPLOYMENT_ENV
} = require('./config')


const VercelAPIBase = 'https://api.vercel.com'
const options = {
	headers: {
		Authorization: `Bearer ${ VERCEL_TOKEN }`
	}
}

const init = () => {
	core.info('Setting environment variables for Vercel ▲ CLI')
	core.exportVariable('VERCEL_ORG_ID', VERCEL_ORG_ID)
	core.exportVariable('VERCEL_PROJECT_ID', VERCEL_PROJECT_ID)

	let deploymentUrl

	const deploy = async (commit) => {
		let commandArguments = [ `--token=${ VERCEL_TOKEN }`, 'deploy' ]

		if (VERCEL_SCOPE) {
			commandArguments.push(`--scope=${ VERCEL_SCOPE }`)
		}

		if (PRODUCTION) {
			commandArguments.push('--prod')
		}

		if (PREBUILT) {
			commandArguments.push('--prebuilt')
			commandArguments.push('--archive=tgz')
		}

		if (FORCE) {
			commandArguments.push('--force')
		}

		if (commit) {
			const metadata = [
				`githubCommitAuthorName=${ commit.authorName }`,
				`githubCommitAuthorLogin=${ commit.authorLogin }`,
				`githubCommitMessage=${ TRIM_COMMIT_MESSAGE ? commit.commitMessage.split(/\r?\n/)[0] : commit.commitMessage }`,
				`githubCommitOrg=${ USER }`,
				`githubCommitRepo=${ REPOSITORY }`,
				`githubCommitRef=${ BRANCH }`,
				`githubCommitSha=${ SHA }`,
				`githubOrg=${ USER }`,
				`githubRepo=${ REPOSITORY }`,
				`githubDeployment=1`
			]

			metadata.forEach((item) => {
				commandArguments = commandArguments.concat([ '--meta', item ])
			})
		}

		if (BUILD_ENV.length) {
			BUILD_ENV.forEach((item) => {
				commandArguments = commandArguments.concat([ '--build-env', item ])
			})
		}

		core.info('Starting deploy with Vercel ▲ CLI')
		const output = await execCmd('npx vercel', commandArguments, WORKING_DIRECTORY)
		const match = output.match(/(?<=https:\/\/)(.*)/g)
		const parsed = match ? match[0] : null

		if (!parsed) throw new Error('🛑 Could not parse deploymentUrl')

		deploymentUrl = parsed

		return deploymentUrl
	}

	const assignAlias = async (aliasUrl) => {
		const commandArguments = [ `--token=${ VERCEL_TOKEN }`, 'alias', 'set', deploymentUrl, removeSchema(aliasUrl) ]

		if (VERCEL_SCOPE) {
			commandArguments.push(`--scope=${ VERCEL_SCOPE }`)
		}

		return await execCmd('npx vercel', commandArguments, WORKING_DIRECTORY)
	}

	const getDeployment = async () => {
		// API Reference: https://vercel.com/docs/rest-api/endpoints/deployments#get-a-deployment-by-id-or-url
		const endpoint = `/v11/now/deployments/get?url=${ deploymentUrl }`
		const url = new URL(endpoint, VercelAPIBase)
		const res = await fetch(url, options)

		return await res.json()
	}

	return {
		deploy,
		assignAlias,
		deploymentUrl,
		getDeployment
	}
}

const setEnvironment = async (key, value) => {
	// API Reference: https://vercel.com/docs/rest-api/endpoints/projects#create-one-or-more-environment-variables
	const endpoint = `/v10/projects/${ VERCEL_PROJECT_ID }/env`

	const url = new URL(endpoint, VercelAPIBase)
	const params = new URLSearchParams(url.search.slice(1))

	params.set('upsert', 'true')

	if (typeof VERCEL_SCOPE !== 'undefined')
		params.set('teamId', VERCEL_SCOPE)

	url.search = params.toString()

	const body = {
		key: key,
		value: value,
		target: [ PRODUCTION ? 'production' : 'preview' ],
		type: 'plain',
		comment: `Set by deploy-to-vercel GitHub Action (${ SHA.substring(0, 7) })`
	}

	if (GITHUB_DEPLOYMENT_ENV.trim() && GITHUB_DEPLOYMENT_ENV !== 'false' && GITHUB_DEPLOYMENT_ENV !== 'null') {
		body.target = [ 'preview' ]
		body.gitBranch = GITHUB_DEPLOYMENT_ENV
	}

	const envOptions = structuredClone(options)
	envOptions.method = 'post'
	envOptions.body = JSON.stringify(body)

	const res = await fetch(url, envOptions)

	return await res.json()
}

module.exports = {
	init,
	setEnvironment
}