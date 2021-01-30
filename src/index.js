const core = require('@actions/core')
const Github = require('./github')
const vercel = require('./vercel')

/*
	To Do:
	- if alias domain is specified add it to deployment
	- check if PR already has comment
	- handle multiple preview urls
*/

const {
	GITHUB_DEPLOYMENT,
	IS_PR,
	PR_LABELS
} = require('./config')

const run = async () => {
	const github = Github.init()

	if (GITHUB_DEPLOYMENT) {
		core.info('Creating GitHub deployment')

		const deployment = await github.createDeployment()
		core.info(`Deployment #${ deployment.id } created`)

		await github.updateDeployment('pending')
		core.info(`Deployment #${ deployment.id } status changed to "pending"`)
	}

	try {
		core.info('Setting environment variables for Vercel CLI')
		await vercel.setEnv()

		core.info(`Creating deployment with Vercel CLI`)
		const result = await vercel.deploy()

		// TODO: Handle multiple urls better
		const previewUrl = Array.isArray(result) ? result[0] : result
		core.info(`Successfully deployed to: ${ previewUrl }`)

		if (GITHUB_DEPLOYMENT) {
			core.info('Changing GitHub deployment status to "success"')
			await github.updateDeployment('success', previewUrl)
		}

		if (IS_PR) {
			core.info('Create comment on PR')

			const comment = await github.createComment(previewUrl)
			core.info(`Comment created: ${ comment.html_url }`)
		}

		if (IS_PR && PR_LABELS) {
			core.info('Adding label(s) to PR')
			const labels = await github.addLabel()
			core.info(`Label(s) "${ labels.map((label) => label.name).join(', ') }" added`)
		}

		core.setOutput('PREVIEW_URL', previewUrl)
		core.setOutput('DEPLOYMENT_CREATED', GITHUB_DEPLOYMENT)
		core.setOutput('COMMENT_CREATED', IS_PR)

		core.info('Done')
	} catch (err) {
		await github.updateDeployment('failure')
		core.setFailed(err.message)
	}
}

run()
	.then(() => {})
	.catch((err) => {
		core.error('ERROR')
		core.setFailed(err.message)
	})