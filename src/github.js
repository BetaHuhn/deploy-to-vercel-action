const { exec } = require('child_process')
const core = require('@actions/core')
const github = require('@actions/github')

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

	let deploymentId

	const message = async () => {
		let commit = await execCmd('git log --format=%B -n 1 HEAD').toString().trim()

		if (!commit || IS_PR) {
			commit = await execCmd('git log --format=%B -n 1 HEAD^2').toString().trim()
		}

		return commit
	}

	const createDeployment = async () => {
		const ref = RUNNING_LOCAL ? 'test' : github.context.ref

		const deployment = await client.repos.createDeployment({
			owner: USER,
			repo: REPOSITORY,
			ref,
			required_contexts: [],
			environment: PRODUCTION ? 'production' : 'staging',
			description: 'Deploy to Vercel'
		})

		deploymentId = deployment.data.id

		return deployment.data
	}

	const updateDeployment = async (status, url) => {
		const sha = RUNNING_LOCAL ? 'test' : github.context.sha
		const logUrl = IS_PR ? `https://github.com/${ USER }/${ REPOSITORY }/pull/${ PR_NUMBER }/checks` : `https://github.com/${ USER }/${ REPOSITORY }/commit/${ sha }/checks`

		const deploymentStatus = await client.repos.createDeploymentStatus({
			owner: USER,
			repo: REPOSITORY,
			deployment_id: deploymentId,
			state: status,
			log_url: logUrl,
			environment_url: url || logUrl,
			description: 'Starting deployment to Vercel'
		})

		return deploymentStatus.data
	}

	return {
		client,
		message,
		createDeployment,
		updateDeployment
	}
}

const execCmd = (command, workingDir) => {
	core.debug(`EXEC: "${ command }" IN ${ workingDir }`)
	return new Promise((resolve, reject) => {
		exec(
			command,
			{
				cwd: workingDir
			},
			function(error, stdout) {
				error ? reject(error) : resolve(stdout.trim())
			}
		)
	})
}

module.exports = {
	init
}