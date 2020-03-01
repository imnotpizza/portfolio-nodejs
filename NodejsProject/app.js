const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session= require('express-session');
const logger=require('morgan');
const bodyParser=require('body-parser');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const saleRouter = require('./routes/sale');
const likeRouter = require('./routes/like');



const flash=require('connect-flash');
const app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({extended: false}));

app.use(logger(":status"), function(req, res, next){
  next();
});

app.use(session({
  secret:'@@@secret@@@',//세션 식별 코드지정
  resave: false,//세션이 변경되기 전까지는 변경되지 않음
  saveUninitialized: true//세션이 필요하기 전까지 구동되지 않음
}));

app.use(flash());

app.use((req, res, next)=>{
  //console.log("####project accessing####");
  next();
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/sale', saleRouter);
app.use('/like', likeRouter);


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






app.listen(3000, function(){
  console.log('!!!CONNECTED!!!');
});

module.exports = app;
