import db from './db.js';
import shortid from 'shortid';

import passport from 'passport'
import {OAuth2Strategy as GoogleStrategy} from 'passport-google-oauth';
import {Strategy as NaverStrategy} from 'passport-naver';
import {Strategy as KakaoStrategy} from 'passport-kakao';

import googleCredentials from '../config/google.json' assert {type: "json"};
import naverCredentials from '../config/naver.json' assert {type: "json"};
import kakaoCredentials from '../config/kakao.json' assert {type: "json"};

export default (app) => {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
      console.log(user)
      done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    let user = db.get('users').find({id:id}).value();
    done(null, user)
  });

  // google social login
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
    }
  ));

  app.get('/login/google',
  passport.authenticate('google', {
      scope: ['https://www.googleapis.com/auth/plus.login','email']
  }));

  app.get('/login/google/callback',
  passport.authenticate('google', {
      failureRedirect: '/login'
  }),
  (req, res) => {
    console.log(req.user.displayName)
    res.json(req.user.displayName)
  });

  // naver social login
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

  app.get('/login/naver',
  passport.authenticate('naver', {
      scope: ['https://nid.naver.com/oauth2.0/authorize','email']
  }));

  app.get('/login/naver/callback',
  passport.authenticate('naver', {
      failureRedirect: '/login'
  }),
  (req, res) => {
    console.log(req.user.displayName)
    res.json(req.user.displayName)
  });

  // kakao social login
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

  app.get('/login/kakao',
  passport.authenticate('kakao', {
      scope: ['profile_nickname', 'account_email']
  }));

  app.get('/login/kakao/callback',
  passport.authenticate('kakao', {
      failureRedirect: '/login'
  }),
  (req, res) => {
    console.log(req.user.displayName)
    res.json(req.user.displayName)
  });

  app.get('/logout', (req,res)=>{
    req.session.destroy(function(err){
        if(err) throw err;
        res.redirect('/login');
    })
})
  return passport;
}