module.exports = function (req, res, next) {
  if (!req.user) {
    return res.status(401).send('Please loge in first')
  }
  return next()
}
