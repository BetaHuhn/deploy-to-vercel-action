const core = require('@actions/core')
const got = require('got')
const { exec, removeSchema } = require('./helpers')

const {
	VERCEL_TOKEN,
	PRODUCTION,
	VERCEL_SCOPE,
	VERCEL_ORG_ID,
	VERCEL_PROJECT_ID,
	SHA,
	USER,
	REPOSITORY,
	REF
} = require('./config')

const init = () => {
	core.info('Setting environment variables for Vercel CLI')
	core.exportVariable('VERCEL_ORG_ID', VERCEL_ORG_ID)
	core.exportVariable('VERCEL_PROJECT_ID', VERCEL_PROJECT_ID)

	let deploymentUrl

	const deploy = async (commit) => {
		let command = `vercel -t ${ VERCEL_TOKEN }`

		if (VERCEL_SCOPE) {
			command += ` --scope ${ VERCEL_SCOPE }`
		}

		if (PRODUCTION) {
			command += ` --prod`
		}

		if (commit) {
			const metadata = [
				`githubCommitAuthorName=${ commit.authorName }`,
				`githubCommitAuthorLogin=${ commit.authorLogin }`,
				`githubCommitMessage=${ commit.commitMessage }`,
				`githubCommitOrg=${ USER }`,
				`githubCommitRepo=${ REPOSITORY }`,
				`githubCommitRef=${ REF }`,
				`githubCommitSha=${ SHA }`,
				`githubOrg=${ USER }`,
				`githubRepo=${ REPOSITORY }`,
				`githubDeployment=1`
			]

			metadata.forEach((item) => {
				command += ` -m "${ item }"`
			})
		}

		const output = await exec(command)

		deploymentUrl = removeSchema(output)

		return deploymentUrl
	}

	const assignAlias = async (aliasUrl) => {
		let command = `vercel alias set ${ deploymentUrl } ${ removeSchema(aliasUrl) } -t ${ VERCEL_TOKEN }`

		if (VERCEL_SCOPE) {
			command += ` --scope ${ VERCEL_SCOPE }`
		}

		const output = await exec(command)

		return output
	}

	const getDeployment = async () => {
		const url = `https://api.vercel.com/v11/now/deployments/get?url=${ deploymentUrl }`
		const options = {
			headers: {
				Authorization: `Bearer ${ VERCEL_TOKEN }`
			}
		}

		const res = await got(url, options).json()

		return res
	}

	return {
		deploy,
		assignAlias,
		deploymentUrl,
		getDeployment
	}
}

module.exports = {
	init
}