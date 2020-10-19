const fetch = require('node-fetch');

// Setup Heroku Scheduler to run job starting at 1:00pm UTC each weekday (exclude weekends)
// using this command: node bin/keepAwake.js

// Script pings listed DYNO_URL every 'interval' minutes (default 
// is 25 minutes since heroku apps sleep after 30 minutes of non-use)

// Since this script runs for 10 hours, this means this application will be awake 
// from 7:00 am AZ time - 5:00 pm AZ time

// Max number of working days is 23 days in a month; 23 days with 10 hours each = 230 dyno hours.
// Heroku free tier gives 1000 free hours per month. This script provides for about 3 or 4
// free apps to be running the whole month.

const hours = 10
const start = Date.now();
const end = start + (hours * 60 * 60 * 1000)

const DYNO_URLS = [
    "https://matt-killian.herokuapp.com/"
]

const interval = 25

const timeouts = []

const keepAwake = (urls, interval= 25) => {
  const milliseconds = interval * 60000

  let todayDate = new Date(Date.now())
  let day = todayDate.getDay()

  if (day > 0 && day < 6 && Date.now() < end) {
    urls.forEach((url, i) => {
      timeouts.push(
        setTimeout(() => {
          try {
            fetch(url)
              .then(() => console.log(`Pinging ${url}`))
              .catch(err => {
                throw new Error(err)
              }) 
          } catch (error) {
              console.log(error)
              console.log('Error pinging ' + url + '. Will try again in ' + interval + ' minutes.')
          } finally {
              return keepAwake(urls, interval);
          }
        }, milliseconds)
      )
    });
  } else if (day === 0 || day === 6) {
    timeouts.forEach(timeout => {
      clearTimeout(timeout)
    })
    console.log('Stopping keep-awake for weekend; will restart on Monday')
  } else {
    timeouts.forEach(timeout => {
      clearTimeout(timeout)
    })
    console.log('Stopping keep-awake for the night; will restart tomorrow morning')
  }
}

console.log('Starting keep-awake to ping each of these URLs every ' + interval + ' minutes: ')
DYNO_URLS.forEach(url => {
  console.log(url)
})
console.log('\n')
keepAwake(DYNO_URLS, interval)