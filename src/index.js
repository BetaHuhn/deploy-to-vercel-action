const core = require('@actions/core')
const github = require('@actions/github')

/*
	Steps:
		- get config
		- check if pr or normal
		- create GitHub deployment
		- setup vercel CLI
		- deploy with vercel CLI
		- wait for vercel build to finish
		- parse preview urls and status
		- update GitHub deployment
		- if pr create comment with preview url
		- set preview urls as output
*/

const {
	GITHUB_TOKEN
} = require('./config')

const run = async () => {
	const client = new github.GitHub(GITHUB_TOKEN)

	core.info(`Repository Info`)
	core.info(`Slug		: `)
	core.info(`Owner		: `)
	core.info(`Https Url	: https://github.com/`)
	core.info(`Branch		: `)
	core.info('	')
	try {
		core.info(client)
		core.info('	')
	} catch (err) {
		core.error(err.message)
		core.error(err)
	}
}

run()
	.then(() => {})
	.catch((err) => {
		core.error('ERROR', err)
		core.setFailed(err.message)
	})