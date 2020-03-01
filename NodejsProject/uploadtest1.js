const express=require('express');
const multer=require('multer');
const path=require('path');

const app=express();

const storage=multer.diskStorage({
    destination: './public/uploads', 
    filename: function(req, file, cb){
        //파일명 + 날짜 + 확장명
        cb(null, Date.now()+"awwwwwerererer");
        
    }
})

const upload=multer({
    storage : storage,
    limits:{fileSize:10000000},
   
}).single('myimg');



// view engine setup
app.set('views', path.join(__dirname, 'bin'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res )=>{
    res.render('index');
})


app.post('/upload', (req, res)=>{

    upload(req, res, (err)=>{
        if(err){
            res.render('index', {msg: err});
        }else{

            console.log(req.file);
            res.render('index', {file : `/uploads/${req.file.filename}`});

        }
    })

    
})




app.listen(3000, ()=>{
    console.log('coo');
})