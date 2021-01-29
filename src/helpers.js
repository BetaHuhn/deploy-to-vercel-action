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

module.exports = {
	exec: execCmd
}