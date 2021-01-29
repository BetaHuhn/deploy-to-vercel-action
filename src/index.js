const core = require('@actions/core')

const Github = require('./github')

/*
	Steps:
		- get config
		- check if pr or normal
		- create GitHub deployment
		- setup vercel CLI
		- deploy with vercel CLI
		- wait for vercel build to finish
		- parse preview urls and status
		- if alias domain add it to deployment
		- update GitHub deployment
		- if pr create comment with preview url
		- set preview urls as output
*/

const {
	/* PRODUCTION,
	IS_PR,
	PR_NUMBER,
	RUNNING_LOCAL,
	USER,
	REPOSITORY */
} = require('./config')

const run = async () => {
	const github = Github.init()

	const deployment = await github.createDeployment()
	console.log(deployment)

	const deploymentStatus = await github.updateDeployment('pending')

	console.log(deploymentStatus)


	// Get commit message
	// const message = await github.message()
}

run()
	.then(() => {})
	.catch((err) => {
		core.error('ERROR', err)
		core.setFailed(err.message)
	})