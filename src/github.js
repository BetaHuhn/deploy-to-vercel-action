const github = require('@actions/github')

const {
	GITHUB_TOKEN,
	IS_PR,
	USER,
	REPOSITORY,
	PRODUCTION,
	PR_NUMBER,
	REF,
	LOG_URL,
	PR_LABELS
} = require('./config')

const init = () => {
	const client = new github.GitHub(GITHUB_TOKEN, { previews: [ 'flash', 'ant-man' ] })

	let deploymentId

	const createDeployment = async () => {
		const deployment = await client.repos.createDeployment({
			owner: USER,
			repo: REPOSITORY,
			ref: REF,
			required_contexts: [],
			environment: PRODUCTION && !IS_PR ? 'Production' : 'Preview',
			description: 'Deploy to Vercel'
		})

		deploymentId = deployment.data.id

		return deployment.data
	}

	const updateDeployment = async (status, url) => {
		if (!deploymentId) return

		const deploymentStatus = await client.repos.createDeploymentStatus({
			owner: USER,
			repo: REPOSITORY,
			deployment_id: deploymentId,
			state: status,
			log_url: LOG_URL,
			environment_url: url || LOG_URL,
			description: 'Starting deployment to Vercel'
		})

		return deploymentStatus.data
	}

	// TODO: Check if pr already has a comment before creating a new one
	const createComment = async (preview) => {
		const body = `
			This pull request has been deployed to Vercel.

			✅ Preview: ${ preview }
			🔍 Logs: ${ LOG_URL }
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

	const addLabel = async () => {
		const label = await client.issues.addLabels({
			owner: USER,
			repo: REPOSITORY,
			issue_number: PR_NUMBER,
			labels: PR_LABELS
		})

		return label.data
	}

	return {
		client,
		createDeployment,
		updateDeployment,
		createComment,
		addLabel
	}
}

module.exports = {
	init
}