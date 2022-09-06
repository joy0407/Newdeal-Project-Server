let express = require('express');
let router = express.Router();

module.exports = ()=>{
    router.get('/logout',(req,res)=>{
      req.logout((err)=>{
        if(err) {return nextTick(err);}
      });
      req.session.save(()=>{  
      res.redirect('/')
      });
    });
  return router;
};