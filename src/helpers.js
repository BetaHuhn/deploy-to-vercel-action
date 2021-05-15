const core = require('@actions/core')
const { exec } = require('child_process')

const execCmd = (command) => {
	core.debug(`EXEC: "${ command }"`)
	return new Promise((resolve, reject) => {
		exec(command, (err, stdout) => {
			err ? reject(err) : resolve(stdout.trim())
		})
	})
}

const addSchema = (url) => {
	const regex = /^https?:\/\//
	if (!regex.test(url)) {
		return `https://${ url }`
	}

	return url
}

const removeSchema = (url) => {
	const regex = /^https?:\/\//
	return url.replace(regex, '')
}

module.exports = {
	exec: execCmd,
	addSchema,
	removeSchema
}