const core = require('@actions/core')
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

	const deploy = async (commitData) => {
		let command = `vercel -t ${ VERCEL_TOKEN }`

		if (VERCEL_SCOPE) {
			command += ` --scope ${ VERCEL_SCOPE }`
		}

		if (PRODUCTION) {
			command += ` --prod`
		}

		if (commitData) {
			const metadata = [
				`githubCommitAuthorName=${ commitData.commit.author.name }`,
				`githubCommitAuthorLogin=${ commitData.author.login }`,
				`githubCommitMessage=${ commitData.commit.message }`,
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

	return {
		deploy,
		assignAlias,
		deploymentUrl
	}
}

module.exports = {
	init
}