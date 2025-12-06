import 'dotenv/config'
import { execSync } from 'child_process'

const { SERVER_HOST, SERVER_USER, DEST_FOLDER } = process.env

const removeCommand = `ssh ${SERVER_USER}@${SERVER_HOST} "rm -rf ${DEST_FOLDER}; mkdir -p ${DEST_FOLDER}"`
console.log('Removing old dist:', removeCommand)
execSync(removeCommand, { stdio: 'inherit', shell: true })

const scpCommand = `scp -r ./dist/* ${SERVER_USER}@${SERVER_HOST}:${DEST_FOLDER}`
console.log('Copying new dist:', scpCommand)
execSync(scpCommand, { stdio: 'inherit', shell: true })

const chmodCommand = `ssh ${SERVER_USER}@${SERVER_HOST} "sudo chmod -R 777 ${DEST_FOLDER}"`
console.log('Removing old dist:', chmodCommand)
execSync(chmodCommand, { stdio: 'inherit', shell: true })
