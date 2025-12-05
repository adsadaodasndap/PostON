import 'dotenv/config'
import { execSync } from 'child_process'

const { SERVER_HOST, SERVER_USER, DEST_FOLDER } = process.env

const copyEnvCommand = `scp .env.production ${SERVER_USER}@${SERVER_HOST}:${DEST_FOLDER}/.env.production`
console.log('Copying production env:', copyEnvCommand)
execSync(copyEnvCommand, { stdio: 'inherit', shell: true })

const deployCommand = `ssh ${SERVER_USER}@${SERVER_HOST} "cd ${DEST_FOLDER}; git pull; pm2 restart server"`
console.log('Deploying on server:', deployCommand)
execSync(deployCommand, { stdio: 'inherit', shell: true })
