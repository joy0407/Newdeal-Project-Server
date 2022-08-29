let express = require('express');
let router = express.Router();
let template = require('../lib/template.js');
let db = require('../lib/db');
const shortid = require('shortid');

module.exports = function(passport){
    router.get('/login',(req,res)=>{
      let html = template.HTML(`
        <form action="/auth/login_process" method="post">
          <p><input type="text" name="email" placeholder="email"></p>
          <p><input type="password" name="pwd" placeholder="pwd"></p>
          <p>
            <input type="submit" value="login">
          </p>
        </form>
      `, '');
      res.send(html);
    });

    router.post('/login_process',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/auth/login',
      failureFlash: true,
      successFlash: true
    }));

    router.get('/register',(req,res)=>{
      let html = template.HTML(`
        <form action="/auth/register_process" method="post">
          <p><input type="text" name="email" placeholder="email"></p>
          <p><input type="password" name="pwd" placeholder="pwd"></p>
          <p><input type="password" name="pwd2" placeholder="check pwd"></p>
          <p><input type="text" name="displayName" placeholder="nick name"></p>
          <p>
            <input type="submit" value="register">
          </p>
        </form>
      `, '');
      res.send(html);
    });

    router.post('/register_process', (req,res)=>{
      let post = req.body;
      let email = post.email;
      let pwd = post.pwd;
      let pwd2 = post.pwd2;
      let displayName = post.displayName;
      if(pwd !== pwd2){
        res.redirect('/auth/register')
      } else {
        bcrypt.hash(pwd, 10, function (err, hash) {
          var user = {
            id: shortid.generate(),
            email: email,
            password: hash,
            displayName: displayName
          };
          db.get('users').push(user).write();
          var user = db.get('users').find({
            email: email
          }).value();
          if (user) {
            user.password = hash;
            user.displayName = displayName;
            db.get('users').find({id:user.id}).assign(user).write();
          } else {
            var user = {
              id: shortid.generate(),
              email: email,
              password: hash,
              displayName: displayName
            };
            db.get('users').push(user).write();
          }
  
          request.login(user, function (err) {
            console.log('redirect');
            return response.redirect('/');
          })
        });
      }
    });

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