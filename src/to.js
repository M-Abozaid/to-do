// simple utility for easy async await error handling
module.exports = function (promise) {
  return promise
    .then(data => {
      return [null, data]
    })
    .catch(err => [err])
}
