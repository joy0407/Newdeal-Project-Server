import express from 'express';
let router = express.Router();
import template from '../lib/template.js';
import auth from '../lib/auth.js'

router.get('/', (req, res) => {
  let html = template.HTML(
    '',
    '',
    auth.statusUI(req,res)
  );
res.send(html)
});
export default router;