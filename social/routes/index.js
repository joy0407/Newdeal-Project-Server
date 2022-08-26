const router = require("./auth");

router.get('/',(req,res)=>{
  let html = ''
  if(req.user){
    html = `<a href="/auth/kakao">kakao</a>`
  } else {
    html = `<a href="/auth/kakao_logout">logout</a>`
  }
  res.send(html)
})
module.exports = router;