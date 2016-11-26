'use strict'

const utils = require('../common/utils.js')
const R = require('ramda')
const mongodb = require('mongodb')

console.log('notifier running...')

const envVarsNeeded = [
  { name: 'deals_mailgun_api', purpose: 'Mailgun API key' },
  { name: 'deals_mailgun_domain', purpose: 'Domain to send mail from' },
  { name: 'deals_mail_to', purpose: 'Mail destination' },
  { name: 'deals_mongourl', purpose: 'MongoDB URL' }
]
const [apiKey, domain, mailTo, mongoUrl] = envVarsNeeded.map(utils.getEnvVar(process.exit.bind(process, 1)))

const mg = require('mailgun-js')({apiKey, domain})

const makeEmail = R.pipe(
  R.reduce((mail, oneDeal) => mail.concat(`<p><a href=${oneDeal.url}>${oneDeal.title}</a> (<a href=${oneDeal.comments}>comments</a>)</p>`), ''),
  mailContent => `<!DOCTYPE html><html><head><title>New deals from /r/buildapcsales</title></head><body>${mailContent}</body></html>`
)

const sendEmail = (deals) => {
  let mail = {
    from: `DealsWatcher <noreply@${domain}>`,
    to: mailTo,
    subject: 'New deals on buildapcsales',
    html: deals
  }
  return mg.messages().send(mail)
}

const updateDeals = R.curry((db, deals) => {
  return deals.map(deal => db.collection('deals').updateOne({title: deal.title}, {$set: {seen: true}}))
})

const processDeals = R.pipe(
    makeEmail,
    sendEmail
  )

mongodb.MongoClient.connect(mongoUrl)
.then(db => {
  db.collection('deals').find({seen: false}).sort({date: 1}).toArray()
  .then(deals => {
    if (deals.length) {
      return processDeals(deals)
      .then(updateDeals.bind(null, db, deals))
    }
  }).then(db.close.bind(db))
  .catch(R.pipe(utils.log, db.close.bind(db)))
}).catch(utils.log)
