'use strict'

const utils = require('../common/utils.js')
const R = require('ramda')

const envVarsNeeded = [
  { name: 'deals_mailgun_api', purpose: 'Mailgun API key' },
  { name: 'deals_mailgun_domain', purpose: 'Domain to send mail from' },
  { name: 'deals_mail_to', purpose: 'Mail destination' }
]
const [apiKey, domain, mailTo] = envVarsNeeded.map(utils.getEnvVar(process.exit.bind(process, 1)))

const mg = require('mailgun-js')({apiKey, domain})

const makeEmail = R.pipe(
  R.reduce((mail, oneDeal) => mail.concat(`<p><a href=${oneDeal.link}>${oneDeal.title}</a></p>`), ''),
  mailContent => `<!DOCTYPE html><html><head><title>New deals from /r/buildapcsales</title></head><body>${mailContent}</body></html>`
)

const sendEmail = (deals) => {
  console.log('sending email')
  let mail = {
    from: `DealsWatcher <noreply@${domain}>`,
    to: mailTo,
    subject: 'New deals on buildapcsales',
    html: deals
  }
  mg.messages().send(mail).then(utils.log).catch(utils.log)
}

const processDeals = deals =>
  R.map(R.pipe(
    R.unless(R.isEmpty, makeEmail),
    R.unless(R.isEmpty, sendEmail)
  ))

