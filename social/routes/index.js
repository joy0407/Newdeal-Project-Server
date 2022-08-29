let express = require('express');
let router = express.Router();
let template = require('../lib/template.js');
let auth = require('../lib/auth')

router.get('/', (req, res) => {
  let html = template.HTML(
    '',
    '',
    auth.statusUI(req,res)
  );
res.send(html)
});
module.exports=router;