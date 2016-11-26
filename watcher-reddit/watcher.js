'use strict'

const utils = require('../common/utils.js')
const rp = require('requestretry')
const xml2js = require('bluebird').Promise.promisifyAll(require('xml2js'))
const R = require('ramda')
const htmlEntities = new (require('html-entities').AllHtmlEntities)()
const mongodb = require('mongodb')

const envVarsNeeded = [
  { name: 'deals_reddit_buildapcsales_url', purpose: 'URL of /r/buildapcsales RSS feed to consider' },
  { name: 'deals_mongourl', purpose: 'MongoDB URL' }
]
const [feedUrl, mongoUrl] = envVarsNeeded.map(utils.getEnvVar(process.exit.bind(process, 1)))

const categoryFilter = R.pipe(R.prop('title'), R.test(/(\[GPU\].*GTX\s*1080)|(\[Mouse\].*)/ig))

const extractLinkFromContent = R.pipe(
  R.prop('_'),
  htmlEntities.decode,
  R.match(/(?:<\/a>\s*?<br\/>\s*?<span><a href=")(.*?)(?:">)/), R.nth(1)
)

const getAllFeedEntries = R.path(['feed', 'entry'])
const pickDataFields = R.pick(['title', 'link', 'updated', 'content'])
const simplifyObject = R.map(R.head)
const cleanupFields = R.evolve({link: R.path(['$', 'href']), content: extractLinkFromContent, updated: R.constructN(1, Date)})
const renameKeys = utils.renameKeys({link: 'comments', content: 'url', updated: 'date'})
const addUnseenField = R.assoc('seen', false)

const processOneFeedEntry = R.pipe(
  pickDataFields,
  simplifyObject,
  cleanupFields,
  renameKeys,
  addUnseenField
)

const addDataToDb = R.curry((db, data) => {
  let indexes = [
    {key: {url: 1}, unique: true},
    {key: {date: 1}},
    {key: {seen: 1}}
  ]

  let col = db.collection('deals')
  col.insertMany(data, {w: 0}) // ignore write failures; duplicate URLs will fail, other failures will get another chance soon anyway
  .then(() => col.createIndexes(indexes))
  .then(() => db.close())
})

const processFeed = R.curry((db, feed) => {
  return xml2js.parseStringAsync(feed)
  .then(R.pipe(
    getAllFeedEntries,
    R.lift(processOneFeedEntry),
    R.filter(categoryFilter),
    addDataToDb(db)
  ))
})

mongodb.MongoClient.connect(mongoUrl)
.then(db => rp.get(feedUrl, {fullResponse: false})
  .then(processFeed(db))
  .catch(R.pipe(utils.log, db.close))
)
