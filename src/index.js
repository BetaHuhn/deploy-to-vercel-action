const core = require('@actions/core')
const { log } = require('./helpers')
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

	// Create Deployment on GitHub
	if (GITHUB_DEPLOYMENT) {
		await github.createDeployment()
		await github.updateDeployment('pending')
	}

	try {
		// Setup vercel project
		await vercel.setEnv()

		// Deploy with Vercel CLI
		const result = await vercel.deploy()

		// TODO: Handle multiple urls better
		const previewUrl = Array.isArray(result) ? result[0] : result
		log.info(`Successfully deployed to ${ previewUrl }`)

		// Change GitHub deployment status
		if (GITHUB_DEPLOYMENT) {
			await github.updateDeployment('success', previewUrl)
		}

		// Create comment on PR
		if (IS_PR) {
			const comment = await github.createComment(previewUrl)
			log.info(`Created comment on PR: ${ comment.html_url }`)
		}

		if (IS_PR && PR_LABELS) {
			const labels = await github.addLabel()
			log.info(`Added label(s) ${ labels.map((label) => label.name).join(', ') } to PR`)
		}

		// Set Action output
		core.setOutput('PREVIEW_URL', previewUrl)
		core.setOutput('DEPLOYMENT_CREATED', GITHUB_DEPLOYMENT)
		core.setOutput('COMMENT_CREATED', IS_PR)

	} catch (err) {
		await github.updateDeployment('failure')
		core.setFailed(err.message)
	}
}

run()
	.then(() => {})
	.catch((err) => {
		log.error('ERROR')
		log.setFailed(err.message)
	})