const core = require('@actions/core')
const { spawn } = require('child_process')

const execCmd = (command, args) => {
	core.debug(`EXEC: "${ command } ${ args }"`)
	return new Promise((resolve, reject) => {
		const process = spawn(command, args)
		let stdout
		let stderr

		process.stdout.on('data', (data) => {
			core.debug(data.toString())
			if (data !== undefined && data.length > 0) {
				stdout += data
			}
		})

		process.stderr.on('data', (data) => {
			core.debug(data.toString())
			if (data !== undefined && data.length > 0) {
				stderr += data
			}
		})

		process.on('close', (code) => {
			code !== 0 ? reject(new Error(stderr)) : resolve(stdout.trim())
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