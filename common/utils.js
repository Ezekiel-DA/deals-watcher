'use strict'

let process = require('process')
let R = require('ramda')

/**
 * Log a value and return it unmodifed
 */
const log = x => !console.log(x) && x

/**
 * Parse an env var descriptor ({name: <env var name>, purpose: <description for err msgs>})
 * and return the corresponding value; if missing, spit out an error call onMissing.
 * NB: this function is curried for ease of use, i.e. you can preload it with an onMissing and reuse it.
 */
const getEnvVar = R.curry((onMissing, varDescriptor) => {
  const val = process.env[varDescriptor.name]
  if (!val) {
    console.log(`[ERROR] Missing ${varDescriptor.purpose}. Set ${varDescriptor.name}.`)
    if (typeof onMissing === 'function') {
      onMissing()
    }
  }
  return val
})

/**
 * Compute (a\b) of sets a and b, i.e. the set of elements that are in a but not in b (in other words "a - b")
 */
const setDifference = R.curry((setA, setB) => new Set([...setA].filter(x => !setB.has(x))))

const logAndExit = (msg, code) => {
  console.log(msg)
  process.exit(code)
}

/**
 * Like Ramda's evolve but only picks the keys for which a transformation (possibly identity) is given
 */
const pickyEvolve = R.curry((transformations, input) => R.pipe(R.pick(R.keys(transformations)), R.evolve(transformations))(input))

/**
 * Clone a source object, renaming the keys according to a given key mapping.
 * Keys missing from the mapping are kept as is.
 * WARNING: behavior in case of name clashes is undefined !
 */
const renameKeys = R.curry((keysMap, src) =>
  R.reduce((dest, key) =>
    R.assoc(keysMap[key] || key, src[key], dest)
  , {}, R.keys(src)))

module.exports = {
  log,
  getEnvVar,
  renameKeys,
  setDifference,
  logAndExit,
  pickyEvolve
}
