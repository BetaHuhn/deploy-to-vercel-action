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
	CREATE_COMMENT,
	DELETE_EXISTING_COMMENT,
	PR_PREVIEW_DOMAIN,
	ALIAS_DOMAINS,
	ATTACH_COMMIT_METADATA,
	LOG_URL,
	DEPLOY_PR_FROM_FORK,
	IS_FORK,
	ACTOR,
	RUN_ID
} = require('./config')

let vercel
let github

const run = async () => {
	github = Github.init()

	// Refuse to deploy an untrusted fork
	if (IS_FORK === true && DEPLOY_PR_FROM_FORK === false) {
		core.warning(`PR is from fork and DEPLOY_PR_FROM_FORK is set to false`)
		const body = `
			Refusing to deploy this Pull Request to Vercel because it originates from @${ ACTOR }'s fork.

			**@${ USER }** To allow this behaviour set \`DEPLOY_PR_FROM_FORK\` to true ([more info](https://github.com/BetaHuhn/deploy-to-vercel-action#deploying-a-pr-made-from-a-fork-or-dependabot)).
		`

		const comment = await github.createComment(body)
		core.info(`Comment created: ${ comment.html_url }`)

		core.setOutput('DEPLOYMENT_CREATED', false)
		core.setOutput('COMMENT_CREATED', true)

		core.info('Done')
		return
	}

	if (GITHUB_DEPLOYMENT) {
		core.info('Creating GitHub deployment')
		const ghDeployment = await github.createDeployment()

		core.info(`Deployment #${ ghDeployment.id } created`)

		await github.updateDeployment('pending')
		core.debug(`Deployment #${ ghDeployment.id } status changed to "pending"`)
	}

	try {
		core.info(`Creating deployment with Vercel CLI`)
		vercel = Vercel.init()

		const commit = ATTACH_COMMIT_METADATA ? await github.getCommit() : undefined
		const deploymentUrl = await vercel.deploy(commit)

		core.info('Successfully deployed to Vercel!')

		const deploymentUrls = []
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

			deploymentUrls.push(addSchema(alias))
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

				deploymentUrls.push(addSchema(alias))
			}
		}

		deploymentUrls.push(addSchema(deploymentUrl))
		const previewUrl = deploymentUrls[0]

		const deployment = await vercel.getDeployment()
		core.info(`Deployment "${ deployment.id }" available at: ${ deploymentUrls.join(', ') }`)

		if (GITHUB_DEPLOYMENT) {
			core.info('Changing GitHub deployment status to "success"')
			await github.updateDeployment('success', previewUrl)
		}

		if (IS_PR) {
			if (DELETE_EXISTING_COMMENT) {
				core.info('Checking for existing comment on PR')
				const deletedCommentId = await github.deleteExistingComment()

				if (deletedCommentId) core.info(`Deleted existing comment #${ deletedCommentId }`)
			}

			if (CREATE_COMMENT) {
				core.info('Creating new comment on PR')
				const body = `
					This pull request has been deployed to Vercel.

					<table>
						<tr>
							<td><strong>Latest commit:</strong></td>
							<td><code>${ SHA.substring(0, 7) }</code></td>
						</tr>
						<tr>
							<td><strong>✅ Preview:</strong></td>
							<td><a href='${ previewUrl }'>${ previewUrl }</a></td>
						</tr>
						<tr>
							<td><strong>🔍 Inspect:</strong></td>
							<td><a href='${ deployment.inspectorUrl }'>${ deployment.inspectorUrl }</a></td>
						</tr>
					</table>

					[View Workflow Logs](${ LOG_URL })
				`

				const comment = await github.createComment(body)
				core.info(`Comment created: ${ comment.html_url }`)
			}

			if (PR_LABELS) {
				core.info('Adding label(s) to PR')
				const labels = await github.addLabel()

				core.info(`Label(s) "${ labels.map((label) => label.name).join(', ') }" added`)
			}
		}

		core.setOutput('PREVIEW_URL', previewUrl)
		core.setOutput('DEPLOYMENT_URLS', deploymentUrls)
		core.setOutput('DEPLOYMENT_ID', deployment.id)
		core.setOutput('DEPLOYMENT_INSPECTOR_URL', deployment.inspectorUrl)
		core.setOutput('DEPLOYMENT_CREATED', true)
		core.setOutput('COMMENT_CREATED', IS_PR && CREATE_COMMENT)

		core.info('Done')
	} catch (err) {
		await github.updateDeployment('failure')
		core.setFailed(err.message)
	}
}

/*
	Try to cancel the deployment when the action run is cancelled.
	GitHub sends a SIGINT to the process when the action is cancelled,
	see https://github.community/t/graceful-job-termination/121103/3
*/
process.on('SIGINT', async () => {
	try {
		core.info(`Caught SIGINT, starting cleanup...`)

		if (vercel) {
			const deployment = await vercel.getDeploymentByRunId(RUN_ID)

			if (deployment) {
				core.debug(`Found matching deployment "${ deployment.uid }" to cancel`)

				await vercel.cancelDeployment(deployment.uid)
				core.info(`Deployment "${ deployment.uid }" cancelled!`)
			} else {
				core.debug(`No matching deployments found to cancel`)
			}
		} else {
			core.debug('No Vercel instance to cancel')
		}

		if (github) {
			core.debug(`Updating GitHub deployment status to "inactive"`)
			await github.updateDeployment('inactive')

			core.info(`GitHub deployment set to "inactive"`)
		}

		core.info('Cleanup done, exiting...')
	} catch (err) {
		core.error('Encountered error during cleanup')
		core.error(err)
	}

	process.exit()
})

run()
	.then(() => {})
	.catch((err) => {
		core.error('ERROR')
		core.setFailed(err.message)
	})