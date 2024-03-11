const core = require('@actions/core')
const { exec } = require('@actions/exec')

const execCmd = async (command, args, cwd) => {
	const options = {}
	let stdout = '▲ '
	let stderr = '🔺 '

	options.listeners = {
		stdout: (data) => {
			stdout += data.toString()
		},
		stderr: (data) => {
			stderr += data.toString()
		}
	}
	options.cwd = cwd

	const exitCode = await exec(command, args, options)

	core.info(`▻ EXEC: "${ command } ${ args }"`)
	if (exitCode === 0)
		throw new Error(`${ stderr } - ${ stdout.trim() }`)
	return stdout.trim()
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