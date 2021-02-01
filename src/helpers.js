const core = require('@actions/core')
const { exec } = require('child_process')

const getVar = ({ key, default: dft, required = false, type = 'string' }) => {
	let coreVar
	if (Array.isArray(key)) {
		key.forEach((item) => {
			if (core.getInput(item)) {
				coreVar = core.getInput(item)
			}
		})
	} else {
		coreVar = core.getInput(key)
	}

	let envVar
	if (Array.isArray(key)) {
		key.forEach((item) => {
			if (item in process.env) {
				envVar = process.env[item]
			}
		})
	} else {
		envVar = process.env[key]
	}

	if (key === 'PR_LABELS' && (coreVar === false || envVar === 'false'))
		return undefined

	if (coreVar !== undefined && coreVar.length >= 1) {
		if (type === 'array') return coreVar.split('\n')
		if (type === 'boolean') return String(coreVar) === 'true'

		return coreVar
	}

	if (envVar !== undefined && envVar.length >= 1) {
		if (type === 'array') return envVar.split(',')
		if (type === 'boolean') return String(envVar) === 'true'

		return envVar
	}

	if (required === true)
		return core.setFailed(`Variable ${ key } missing.`)

	return dft

}

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
	getVar,
	addSchema,
	removeSchema
}