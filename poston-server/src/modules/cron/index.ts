import cron from 'node-cron'

// Каждая минута
cron.schedule('* * * * *', () => {
  console.log('running a task every minute')
})
// Или в каждой минуте десятая секунда: 10 * * * * *

// Каждая секунда
// cron.schedule('* * * * * *', () => {
//   console.log('running a task every second')
// })

// Каждый день в 9:30
cron.schedule('30 9 * * *', () => {
  console.log('running a task every 9 30')
})

// 25-ое число каждого месяца в 9:30
cron.schedule('30 9 25 * *', () => {
  console.log('running a task every 25.x at 9:30')
})
