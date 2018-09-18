require('dotenv').config()

const createError = require('http-errors')
const express = require('express')
const path = require('path')
const logger = require('morgan')
const cors = require('cors')
const RateLimit  = require('express-rate-limit')
const bodyParser = require('body-parser')

const indexRouter = require('./routes/index')

const app = express()

app.enable('trust proxy')

const limiter = new RateLimit({
  windowMs:5*60*1000,
  max: 150,
  delayMs: 3*100,
  delayAfter: 100,
  message: "Sheesh, slow down with your requests."
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(limiter)
app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.send(err)
})

module.exports = app
