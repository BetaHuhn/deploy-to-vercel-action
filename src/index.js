const core = require('@actions/core')
const Github = require('./github')
const Vercel = require('./vercel')
const { addSchema } = require('./helpers')

const {
	GITHUB_DEPLOYMENT,
	USER,
	REPOSITORY,
	BRANCH,
	PR_NUMBER,
	SHA,
	IS_PR,
	PR_LABELS,
	DELETE_EXISTING_COMMENT,
	PR_PREVIEW_DOMAIN,
	ALIAS_DOMAINS
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
		core.info(`Creating deployment with Vercel CLI`)
		const vercel = Vercel.init()
		const deploymentUrl = await vercel.deploy()

		const previewUrls = []
		if (IS_PR && PR_PREVIEW_DOMAIN) {
			core.info(`Assigning custom preview domain to PR`)

			const alias = PR_PREVIEW_DOMAIN
				.replace('{USER}', USER)
				.replace('{REPO}', REPOSITORY)
				.replace('{BRANCH}', BRANCH)
				.replace('{PR}', PR_NUMBER)
				.replace('{SHA}', SHA.substring(0, 7))
				.toLowerCase()

			await vercel.assignAlias(alias)

			previewUrls.push(addSchema(alias))
		}

		if (!IS_PR && ALIAS_DOMAINS) {
			core.info(`Assigning custom domains to Vercel deployment`)

			for (let i = 0; i < ALIAS_DOMAINS.length; i++) {
				const alias = ALIAS_DOMAINS[i]
					.replace('{USER}', USER)
					.replace('{REPO}', REPOSITORY)
					.replace('{BRANCH}', BRANCH)
					.replace('{SHA}', SHA.substring(0, 7))
					.toLowerCase()

				await vercel.assignAlias(alias)

				previewUrls.push(addSchema(alias))
			}
		}

		previewUrls.push(addSchema(deploymentUrl))
		core.info(`Deployment available at: ${ previewUrls.join(', ') }`)

		if (GITHUB_DEPLOYMENT) {
			core.info('Changing GitHub deployment status to "success"')
			await github.updateDeployment('success', previewUrls[0])
		}

		if (IS_PR) {
			if (DELETE_EXISTING_COMMENT) {
				core.info('Checking for existing comment on PR')
				const deletedCommentId = await github.deleteExistingComment()

				if (deletedCommentId) core.info(`Deleted existing comment #${ deletedCommentId }`)
			}

			core.info('Creating new comment on PR')
			const comment = await github.createComment(previewUrls[0])

			core.info(`Comment created: ${ comment.html_url }`)

			if (PR_LABELS) {
				core.info('Adding label(s) to PR')
				const labels = await github.addLabel()

				core.info(`Label(s) "${ labels.map((label) => label.name).join(', ') }" added`)
			}
		}

		core.setOutput('PREVIEW_URL', previewUrls[0])
		core.setOutput('DEPLOYMENT_URLS', previewUrls)
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