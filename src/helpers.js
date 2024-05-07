const { StringDecoder } = require('string_decoder')

const crypto = require('crypto')
const core = require('@actions/core')
const { exec } = require('@actions/exec')

const {
	USER,
	REPOSITORY,
	BRANCH,
	PR_NUMBER,
	SHA
} = require('./config')

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

	core.info(`\u001b[33m▻ EXEC: "${ command } ${ args }"`)

	try {
		exitCode = await exec(command, args, options)
	} catch (ignoreErr) {
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

// Following https://perishablepress.com/stop-using-unsafe-characters-in-urls/ only allow characters that won't break as a domain name
const urlSafeParameter = (input) => input.replace(/[^a-z0-9~]/gi, '-')

const aliasFormatting = (alias) => {
	let validAlias = alias.replace('{USER}', urlSafeParameter(USER))
		.replace('{REPO}', urlSafeParameter(REPOSITORY))
		.replace('{BRANCH}', urlSafeParameter(BRANCH))
		.replace('{PR}', PR_NUMBER)
		.replace('{SHA}', SHA.substring(0, 7))
		.toLowerCase()

	const previewDomainSuffix = '.vercel.app'

	if (validAlias.endsWith(previewDomainSuffix)) {
		let prefix = validAlias.substring(0, validAlias.indexOf(previewDomainSuffix))

		if (prefix.length >= 60) {
			core.warning(`⚠️ The alias ${ prefix } exceeds 60 chars in length, truncating using vercel's rules. See https://vercel.com/docs/concepts/deployments/automatic-urls#automatic-branch-urls`)
			prefix = prefix.substring(0, 55)
			const uniqueSuffix = crypto.createHash('sha256')
				.update(`git-${ BRANCH }-${ REPOSITORY }`)
				.digest('hex')
				.slice(0, 6)

			validAlias = `${ prefix }-${ uniqueSuffix }${ previewDomainSuffix }`
		}
	}
	return validAlias
}

module.exports = {
	execCmd,
	addSchema,
	removeSchema,
	aliasFormatting
}