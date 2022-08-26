const express = require('express');
const router = express.Router();
const passport = require('passport')
router.get('/kakao', passport.authenticate('kakao'));
 
router.get(
   '/kakao/callback',
   passport.authenticate('kakao', {
      failureRedirect: '/', // kakaoStrategy에서 실패한다면 실행
   }),
   // kakaoStrategy에서 성공한다면 콜백 실행
   (req, res) => {
      res.redirect('/');
   },
);

  router.get('/kakao_logout',(req,res)=>{
    req.logout((err)=>{
      if(err) {return nextTick(err);}
    });
    // session delete
    //req.session.destroy((err)=>{
    req.session.save(()=>{  
    res.redirect('/')
    });
  });
module.exports=router;