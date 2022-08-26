const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
// const { User } = require('../models');
const info = require('../config/info.json')

module.exports = (app) => {
    app.use(passport.initialize()); // passport를 초기화 하기 위해서 passport.initialize 미들웨어 사용
    passport.use(
        new KakaoStrategy({
            clientID: info.kakao.kakaoID, // 카카오 로그인에서 발급받은 REST API 키
            callbackURL: info.kakao.callbackURL, // 카카오 로그인 Redirect URI 경로
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log(profile.id,profile.displayName);
            } catch (error) {
                console.error(error);
                done(error);
            }
        },
        ),
    );
    passport.serializeUser((user,done)=>{ 
        done(null,user);
    });
    passport.deserializeUser((user,done)=>{
        done(null,user);
    });
    return passport
}