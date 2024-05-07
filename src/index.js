const core = require('@actions/core')
const Github = require('./github')
const Vercel = require('./vercel')
const { addSchema, aliasFormatting } = require('./helpers')

const {
	GITHUB_DEPLOYMENT,
	USER,
	SHA,
	IS_PR,
	PR_LABELS,
	CREATE_COMMENT,
	DELETE_EXISTING_COMMENT,
	PR_PREVIEW_DOMAIN,
	ALIAS_DOMAINS,
	RUNTIME_ENV,
	ATTACH_COMMIT_METADATA,
	LOG_URL,
	DEPLOY_PR_FROM_FORK,
	IS_FORK,
	ACTOR
} = require('./config')

const run = async () => {
	const github = Github.init()

	// Refuse to deploy an untrusted fork
	if (IS_FORK === true && DEPLOY_PR_FROM_FORK === false) {
		core.warning(`PR is from fork and DEPLOY_PR_FROM_FORK is set to false`)
		const body = `
			Refusing to deploy this Pull Request to Vercel because it originates from @${ ACTOR }'s fork.

			**@${ USER }** To allow this behavior set \`DEPLOY_PR_FROM_FORK\` to true ([more info](https://github.com/mountainash/deploy-to-vercel-action#deploying-a-pr-made-from-a-or-dependabot)).
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
		core.info(`Deployment #${ ghDeployment.id } status changed to "pending" ⌛`)
	}

	try {
		if (RUNTIME_ENV.length) {
			core.info('Setting environment variables on Vercel ▲')

			core.debug(`RUNTIME_ENV: ${ RUNTIME_ENV }`)

			if (!Array.isArray(RUNTIME_ENV)) {
				throw new Error('🛑 RUNTIME_ENV should be in array format')
			}

			for (let i = 0; i < RUNTIME_ENV.length; i++) {
				const [ key, value ] = RUNTIME_ENV[i].split('=')
				core.debug(`RUNTIME_ENV ${ i }: ${ key }, ${ value }`)

				if (!key || !value) {
					throw new Error('🛑 RUNTIME_ENV each line should be in the format "key=value"')
				}

				const res = await Vercel.setEnvironment(key, value)
				core.debug(`RUNTIME_ENV Response: ${ JSON.stringify(res) }`)

				if (res.error) {
					throw new Error(`🛑 RUNTIME_ENV API Error: ${ res.error.message }`)
				}
			}
		}

		core.info('Creating deployment with Vercel ▲ CLI')
		const vercel = Vercel.init()

		const commit = ATTACH_COMMIT_METADATA ? await github.getCommit() : undefined
		const deploymentUrl = await vercel.deploy(commit)

		core.info('Successfully deployed to Vercel ▲')

		const deploymentUrls = []
		if (IS_PR && PR_PREVIEW_DOMAIN) {
			core.info('Assigning custom preview domain to PR 🌐')

			if (typeof PR_PREVIEW_DOMAIN !== 'string') {
				throw new Error('🛑 invalid type for PR_PREVIEW_DOMAIN')
			}

			const nextAlias = aliasFormatting(PR_PREVIEW_DOMAIN)

			await vercel.assignAlias(nextAlias)
			core.info(`Updated domain alias: ${ nextAlias }`)

			deploymentUrls.push(addSchema(nextAlias))
		}

		if (ALIAS_DOMAINS.length) {
			core.info('Assigning alias domains to deployment 🌐')

			if (!Array.isArray(ALIAS_DOMAINS)) {
				throw new Error('🛑 ALIAS_DOMAINS should be in array format')
			}

			for (let i = 0; i < ALIAS_DOMAINS.length; i++) {
				// check for "falsey" can often be null and empty values
				if (!ALIAS_DOMAINS[i]) continue

				const alias = aliasFormatting(ALIAS_DOMAINS[i])

				await vercel.assignAlias(alias)

				deploymentUrls.push(addSchema(alias))
			}
		}

		deploymentUrls.push(addSchema(deploymentUrl))
		const previewUrl = deploymentUrls[0]

		const deployment = await vercel.getDeployment()
		core.info(`Deployment "${ deployment.id }" available at: ${ deploymentUrls.join(' ') }`)

		if (GITHUB_DEPLOYMENT) {
			core.info('Changing GitHub deployment status to "success" ✔︎')
			await github.updateDeployment('success', previewUrl)
		}

		if (IS_PR) {
			if (DELETE_EXISTING_COMMENT) {
				core.info('Checking for existing comment on PR 🔎')
				const deletedCommentId = await github.deleteExistingComment()

				if (deletedCommentId)
					core.info(`Deleted existing comment #${ deletedCommentId } 🚮`)
			}

			if (CREATE_COMMENT) {
				core.info('Creating new comment on PR 💬')
				const body = `
					This pull request has been deployed to Vercel ▲.

					<table>
						<tr>
							<th>Latest Commit</th>
							<td><code>${ SHA.substring(0, 7) }</code></td>
						</tr>
						<tr>
							<th>👀 Preview</th>
							<td><a href='${ previewUrl }'>${ previewUrl }</a></td>
						</tr>
						<tr>
							<th>🔍 Inspect</th>
							<td><a href='${ deployment.inspectorUrl }'>${ deployment.inspectorUrl }</a></td>
						</tr>
					</table>

					[View GitHub Actions Workflow Logs](${ LOG_URL })
				`

				const comment = await github.createComment(body)
				core.info(`Comment created: ${ comment.html_url }`)
			}

			if (PR_LABELS.length) {
				core.info('Adding label(s) to PR 🏷️')
				const labels = await github.addLabel()

				core.info(`Label(s) "${ labels.map((label) => label.name).join(', ') }" added`)
			}
		}

		const deploymentUniqueURL = deploymentUrls[deploymentUrls.length - 1]

		core.setOutput('PREVIEW_URL', previewUrl)
		core.setOutput('DEPLOYMENT_URLS', deploymentUrls)
		core.setOutput('DEPLOYMENT_UNIQUE_URL', deploymentUniqueURL)
		core.setOutput('DEPLOYMENT_ID', deployment.id)
		core.setOutput('DEPLOYMENT_INSPECTOR_URL', deployment.inspectorUrl)
		core.setOutput('DEPLOYMENT_CREATED', true)
		core.setOutput('COMMENT_CREATED', IS_PR && CREATE_COMMENT)

		const summaryMD = `## Deploy to Vercel ▲
| Name | Link |
| :--- | :--- |
| 🔍 Inspect	| <${ deployment.inspectorUrl }> |
| 👀 Preview	| <${ previewUrl }> |
| 🌐 Unique 	| <${ deploymentUniqueURL }> |
| 🌐 Others 	| ${ deploymentUrls.join('<br>') } |
		`

		await core.summary.addRaw(summaryMD).write()

		// Set environment variable for use in subsequent job steps
		core.exportVariable('VERCEL_PREVIEW_URL', previewUrl)
		core.exportVariable('VERCEL_DEPLOYMENT_UNIQUE_URL', deploymentUniqueURL)

		core.info('Done')
	} catch (err) {
		await github.updateDeployment('failure')
		core.error(`Catch Error: ${ err }`)
		core.setFailed(err.message)
	}
}

run()