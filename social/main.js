const express = require('express');
const app = express()
let bodyParser = require('body-parser');
let helmet = require('helmet');
let session = require('express-session');
let FileStore = require('session-file-store')(session)

app.use(helmet());

// bodyParser.urlencoded({extended:false}): 사용자가 요청할 때마다 실행되는 미들웨어
app.use(bodyParser.urlencoded({extended:false}));

app.use(session({
  secret: 'key',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));

// passport는 session을 바탕으로 하기 때문에 session밑에다가 넣어줘야함
let passport = require('./lib/passport')(app);

let indexRouter = require('./routes/index');
let authRouter = require('./routes/auth')(passport);

app.use('/',indexRouter);
app.use('/auth',authRouter);

app.use((req,res,next)=>{
  res.status(404).send('Sorry');
});
// 500error: 서버에서 문제가 발생했으나 구체적인 내용을 표시할 수 없음
app.use((err, req, res, next)=>{
  console.error(err.stack)
  res.status(500).send('Somethong Broke!')
});

app.listen(3000);