var express = require('express');
var router = express.Router();


/* 포트폴리오 메인 라우터 작성 */
router.get('/', function(req, res) {
 
  res.render('portfolio');

});

router.get('/hello', (req, res)=>{
  res.render('vue1');
})

router.get('/vue2', (req, res)=>{
  res.render('vue2');
})



module.exports = router;
