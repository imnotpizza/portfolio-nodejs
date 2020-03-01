var express = require('express');
var router = express.Router();

app.set('views', path.join(__dirname, '/views/portfolio'));
app.set('view engine', 'ejs');

router.get('/', (req, res)=>{
    res.render('portfolio');
})

module.exports = router;