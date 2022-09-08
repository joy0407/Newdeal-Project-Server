import express from 'express';
const app = express()
import bodyParser from 'body-parser';
import helmet from 'helmet';
import session from 'express-session';

app.use(helmet());

// bodyParser.urlencoded({extended:false}): 사용자가 요청할 때마다 실행되는 미들웨어
app.use(bodyParser.urlencoded({extended:false}));

app.use(session({
  secret: 'key',
  resave: false,
  saveUninitialized: true
}));

// passport는 session을 바탕으로 하기 때문에 session밑에다가 넣어줘야함
import passport from './lib/passport.js'
passport(app);

import indexRouter from './routes/index.js';
app.use('/login',indexRouter);

app.use((req,res,next)=>{
  res.status(404).send('Sorry, Page Not Found');
});
// 500error: 서버에서 문제가 발생했으나 구체적인 내용을 표시할 수 없음
app.use((err, req, res, next)=>{
  console.error(err.stack)
  res.status(500).send('Somethong Broke!')
});

app.listen(3000);