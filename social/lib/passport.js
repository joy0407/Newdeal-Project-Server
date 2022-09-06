let db = require('../lib/db');
let shortid = require('shortid');

module.exports = (app) => {

  let passport = require('passport')
  let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  let NaverStrategy = require('passport-naver').Strategy;
  let KakaoStrategy = require('passport-kakao').Strategy;

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
      done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    let user = db.get('users').find({id:id}).value();
    done(null, user)
  });

  // google social login
  let googleCredentials = require('../config/google.json');
  passport.use(new GoogleStrategy(
    {
      clientID: googleCredentials.web.client_id,
      clientSecret: googleCredentials.web.client_secret,
      callbackURL: googleCredentials.web.redirect_uris[0]
    },
    function(accessToken, refreshToken, profile, done) {
      let email = profile.emails[0].value;
      let user = db.get('users').find({email:email}).value();
      // 기존 user가 존재한다면
        if(user){
          user.googleId = profile.id;
          db.get('users').find({id:user.id}).assign(user).write();
      } else {
          user = {
              id:shortid.generate(),
              email:email,
              displayName:profile.displayName,
              googleId:profile.id
          }
          db.get('users').push(user).write();
      }
      done(null, user);
      // User.findOrCreate({ googleId: profile.id }, (err, user) => {
      //   return done(err, user);
      // });
    }
  ));

  app.get('/auth/google',
  passport.authenticate('google', {
      scope: ['https://www.googleapis.com/auth/plus.login','email']
  }));

  app.get('/auth/google/callback',
  passport.authenticate('google', {
      failureRedirect: '/auth/login'
  }),
  (req, res) => {
      res.redirect('/');
  });

  // naver social login
  let naverCredentials = require('../config/naver.json');
  passport.use(new NaverStrategy(
    {
      clientID: naverCredentials.naver.client_id,
      clientSecret: naverCredentials.naver.client_secret,
      callbackURL: naverCredentials.naver.redirect_uris
    },
    function(accessToken, refreshToken, profile, done) {
      let email = profile.emails[0].value;
      let user = db.get('users').find({email:email}).value();
      // 기존 user가 존재한다면
        if(user){
          user.naverId = profile.id;
          db.get('users').find({id:user.id}).assign(user).write();
      } else {
          user = {
              id:shortid.generate(),
              email:email,
              displayName:profile.displayName,
              naverId:profile.id
          }
          db.get('users').push(user).write();
      }
      done(null, user);
    }
  ));

  app.get('/auth/naver',
  passport.authenticate('naver', {
      scope: ['https://nid.naver.com/oauth2.0/authorize','email']
  }));

  app.get('/auth/naver/callback',
  passport.authenticate('naver', {
      failureRedirect: '/auth/login'
  }),
  (req, res) => {
      res.redirect('/');
  });

  // kakao social login
  let kakaoCredentials = require('../config/kakao.json');
  passport.use(new KakaoStrategy(
    {
      clientID: kakaoCredentials.kakao.client_id,
      clientSecret: kakaoCredentials.kakao.client_secret,
      callbackURL: kakaoCredentials.kakao.redirect_uris
    },
    function(accessToken, refreshToken, profile, done) {
      let email = profile._json && profile._json.kakao_account_email;
      let user = db.get('users').find({email:email}).value();
      // 기존 user가 존재한다면
        if(user){
          user.kakaoId = profile.id;
          db.get('users').find({id:user.id}).assign(user).write();
      } else {
          user = {
              id:shortid.generate(),
              email:profile._json && profile._json.kakao_account_email,
              displayName:profile.displayName,
              kakaoId:profile.id
          }
          db.get('users').push(user).write();
      }
      done(null, user);
    }
  ));

  app.get('/auth/kakao',
  passport.authenticate('kakao', {
      scope: ['account_email']
  }));

  app.get('/auth/kakao/callback',
  passport.authenticate('kakao', {
      failureRedirect: '/auth/login'
  }),
  (req, res) => {
      res.redirect('/');
  });
  return passport;
} 