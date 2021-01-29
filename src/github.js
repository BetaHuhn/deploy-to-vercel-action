const github = require('@actions/github')
const { log } = require('./helpers')

const {
	GITHUB_TOKEN,
	IS_PR,
	USER,
	REPOSITORY,
	RUNNING_LOCAL,
	PRODUCTION,
	PR_NUMBER
} = require('./config')

const init = () => {
	const client = new github.GitHub(GITHUB_TOKEN, { previews: [ 'flash', 'ant-man' ] })
	const sha = RUNNING_LOCAL ? '' : github.context.sha
	const logUrl = IS_PR ? `https://github.com/${ USER }/${ REPOSITORY }/pull/${ PR_NUMBER }/checks` : `https://github.com/${ USER }/${ REPOSITORY }/commit/${ sha }/checks`

	let deploymentId

	const createDeployment = async () => {
		const ref = RUNNING_LOCAL ? 'refs/heads/master' : github.context.ref

		const deployment = await client.repos.createDeployment({
			owner: USER,
			repo: REPOSITORY,
			ref,
			required_contexts: [],
			environment: PRODUCTION ? 'Production' : 'Preview',
			description: 'Deploy to Vercel'
		})

		deploymentId = deployment.data.id

		log.info(`Deployment #${ deploymentId } created`)

		return deployment.data
	}

	const updateDeployment = async (status, url) => {
		if (!deploymentId) return

		const deploymentStatus = await client.repos.createDeploymentStatus({
			owner: USER,
			repo: REPOSITORY,
			deployment_id: deploymentId,
			state: status,
			log_url: logUrl,
			environment_url: url || logUrl,
			description: 'Starting deployment to Vercel'
		})

		log.info(`Deployment ${ deploymentId } status changed to ${ status }`)

		return deploymentStatus.data
	}

	// TODO: Check if pr already has a comment before creating a new one
	const createComment = async (preview) => {
		const body = `
			This pull request has been deployed to Vercel.

			✅ Preview: ${ preview }
			🔍 Logs: ${ logUrl }
		`

		// Remove indentation
		const dedented = body.replace(/^[^\S\n]+/gm, '')

		const comment = await client.issues.createComment({
			owner: USER,
			repo: REPOSITORY,
			issue_number: PR_NUMBER,
			body: dedented
		})

		return comment.data
	}

	return {
		client,
		createDeployment,
		updateDeployment,
		createComment
	}
}

module.exports = {
	init
}