const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors=require('cors');

const dotenv= require('dotenv').config();
const passport = require("passport");


const accountRouter = require('./routes/accountRoute');
const boardRouter = require("./routes/board.route");
const usersRouter = require("./routes/user.route");
const profileRouter = require("./routes/profile.route")
const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(passport.initialize());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

require('./middleware/passport');


app.use('/account', accountRouter);
app.use("/boards",passport.authenticate('jwt', {
  session: false
}),boardRouter)
// app.use(AuthMiddleWare.isAuth);
app.use('/users', usersRouter);

app.use('/', passport.authenticate('jwt', {
  session: false
}), profileRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
