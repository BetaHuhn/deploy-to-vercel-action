const core = require('@actions/core')
const { exec } = require('child_process')

const log = {
	info(text) {
		core.info(text)
	},
	debug(text) {
		core.debug(text)
	},
	error(text) {
		core.error(text)
	},
	setFailed(text) {
		core.setFailed(text)
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
	exec: execCmd,
	log
}