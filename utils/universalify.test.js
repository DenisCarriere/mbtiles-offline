const test = require('tape')
const universalify = require('./universalify')

function fnPromise (message) {
  return new Promise((resolve, reject) => {
    return resolve(message)
  })
}

function fnCallback (message, callback) {
  return callback(null, message)
}

test('universalify -- fromCallback', t => {
  const fn = universalify.fromCallback(fnCallback)
  fn('bar')
    .then(message => t.equal(message, 'bar', 'fromCallback - promise'))
    .catch(() => t.error('promise error'))

  fn('bar', (error, message) => {
    if (error) t.error('callback error')
    t.equal(message, 'bar', 'fromCallback - callback')
  })
  t.end()
})

test('universalify -- fromPromise', t => {
  const fn = universalify.fromPromise(fnPromise)
  fn('bar')
    .then(message => t.equal(message, 'bar', 'fromPromise - promise'))
    .catch(() => t.error('promise error'))

  fn('bar', (error, message) => {
    if (error) t.error('callback error')
    t.equal(message, 'bar', 'fromPromise - callback')
  })
  t.end()
})
