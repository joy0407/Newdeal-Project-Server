const express = require('express');
const app = express()
const session = require('express-session');
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));
// npm install -S passport
// npm install -S passport-local
// passport는 session을 바탕으로 하기 때문에 session밑에다가 넣어줘야함
let passport = require('./passport')(app);

let indexRouter = require('./routes/index');
let authRouter = require('./routes/auth');
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

app.listen(3002);