const { StringDecoder } = require('string_decoder')

const core = require('@actions/core')
const { exec } = require('@actions/exec')

const execCmd = async (command, args, cwd) => {
	const options = {}
	let stdout = ''
	let stderr = ''
	let exitCode = 0

	const stdoutDecoder = new StringDecoder('utf8')
	const stderrDecoder = new StringDecoder('utf8')

	options.listeners = {
		stdout: (data) => {
			stdout += stdoutDecoder.write(data)
		},
		stderr: (data) => {
			stderr += stderrDecoder.write(data)
		}
	}

	if (cwd !== '') {
		options.cwd = cwd
	}

	options.silent = false

	core.info(`▻ EXEC: "${ command } ${ args }"`)

	try {
		exitCode = await exec(command, args, options)
	} catch (error) {
		exitCode = 1
	}

	stdout += stdoutDecoder.end()
	stderr += stderrDecoder.end()

	if (exitCode === 0)
		return stdout.trim()

	throw new Error(`${ command } ${ args.join(' ') } returned code ${ exitCode } \nSTDOUT: ${ stdout }\nSTDERR: ${ stderr }`)
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
	execCmd,
	addSchema,
	removeSchema
}