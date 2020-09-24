const fetch = require('node-fetch');

// Setup Heroku Scheduler to run job starting at 12:00pm UTC each day
// Since this script runs for 14 hours, this means this application will be awake 
// from 5:00 am AZ time - 7:00 pm AZ time

// Script pings listed DYNO_URL every 'interval' minutes (default 
// is 25 minutes since heroku apps sleep after 30 minutes of non-use)

// Setup Heroku Scheduler job to run using this command: node bin/keepAwake.js

const hours = 14
const start = Date.now();
const end = start + (hours * 60 * 60 * 1000)

const DYNO_URLS = [
    "https://matt-killian.herokuapp.com/"
]

const interval = 25

const timeouts = []

const keepAwake = (urls, interval= 25) => {
  const milliseconds = interval * 60000

  if (Date.now() < end) {
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
  } else {
    timeouts.forEach(timeout => {
      clearTimeout(timeout)
    })
    console.log('Stopping keep-awake until heroku scheduler starts it again')
  }
}

console.log('Starting keep-awake to ping each of these URLs every ' + interval + ' minutes: ')
DYNO_URLS.forEach(url => {
  console.log(url)
})
console.log('\n')
keepAwake(DYNO_URLS, interval)