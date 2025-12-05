import cron from 'node-cron'

// Schedule a daily job at 00:00 (midnight)
cron.schedule('0 0 * * *', () => {
  console.log('Running daily scheduled tasks...')
  // TODO: implement cron tasks (e.g., send reports, cleanup, etc.)
})
