const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const debug = require('debug')('todo:app')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const tasksRouter = require('./routes/tasks')
const listsRouter = require('./routes/lists')

const passport = require('passport')
const User = require('./models/user')
const config = require('./config')
const mongoose = require('mongoose')

mongoose.connect(config.DB_URI)
const mongooseConnection = mongoose.connection

mongooseConnection.once('open', function callback () {
  debug('DB connection is open')
})

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

if (app.get('env') === 'development') {
  app.use(logger('combined'))
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: config.SESSIONS_SECRET,
  // persistent session store
  store: new MongoStore({
    mongooseConnection,
    ttl: 30 * 24 * 60 * 60
  })
}))

// configure authentication
app.use(passport.initialize())
app.use(passport.session())

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/tasks', tasksRouter)
app.use('/lists', listsRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
