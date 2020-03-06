var express = require('express');
var router = express.Router();
const bodyParser=require('body-parser');



router.use(bodyParser.urlencoded({extended: false}));

const { Pool, Client } = require('pg')

function getIdFromSession(req){
  var val;
  if(req.session.sid!=undefined){
    val=req.session.sid;
    return val;
  }else{
    return 'PleaseLogin';
  }
}

function logcheck(req){
  console.log(req.session.sid+"  "+req.session.spw);
  if(req.session.sid!=null && req.session.spw!=null){
    console.log("@@@session prepared@@@");
    return true;
    
  }else if(req.session.sid==undefined){
    return false;
  }
}

// pools will use environment variables
// for connection information

const client = new Pool({
  user: "postgres",
  host: "petdeal-db.ckaysdqxrb6e.ap-northeast-2.rds.amazonaws.com",
  database: "postgres",
  password: "freesoul1712",
  multipleStatements: true,
  port: 5432
})

router.get('/register', function(req, res, next) {
  res.render('users_register', {logcheck : logcheck(req)});
});

router.post('/register', (req, res)=>{
  const queryStr=`insert into users 
  (id, name, password, email, phone, available_loc, available_time_from, available_time_until) 
  values($1, $2, $3, $4, $5 ,$6 ,$7 ,$8)`;
  const values=[req.body.id ,
      req.body.name ,
      req.body.password ,
      req.body.email,
      req.body.phone ,
      req.body.available_loc,
      req.body.available_time_from,
      req.body.available_time_until,
   ];

  client.query(queryStr,values, (err, res) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(res.rows[0])
      }
  });

  res.redirect('/sale');
})



router.get('/login', (req, res)=>{
  res.render('users_login', {logcheck : logcheck(req)});
  
})



router.post('/login', (req, res)=>{
  var useCookie=req.body.useCookie;
  console.log('### : '+req.body.id+"  "+req.body.password+"  "+req.body.useCookie);
  

  const queryStr=`select id, password from users where id=$1`
  const value=[req.body.id];

  client.query(queryStr, value, (err, result)=>{
      
      if(err){
          console.log("no id/pw values");
      }else{
          try{
              var idfromdb=result.rows[0].id;
              var pwfromdb=result.rows[0].password;
              
              
              //성공시 쿠키/세션 저장
              if(idfromdb===req.body.id && pwfromdb===req.body.password){

                  req.session.sid=idfromdb;
                  req.session.spw=pwfromdb;

                  
                  res.cookie('islogin', true, {
                      maxAge: 60*60*600
                    });
                  

                 

                  console.log("login success");
                  res.redirect("/sale");
              }else{
                  //pw만틀림
                  console.log("login failed");
                  res.redirect("/users/login");

              }
          }catch(e){
              //id pw 둘다틀림
              console.log("!!exception!!");
              res.redirect("/users/register");

          }
         
      }
  })

})

router.get('/logout', (req, res)=>{

  var sUser=getIdFromSession(req);

  req.session.destroy(function(){
    req.session;
  })
  res.redirect('/sale');
  
})




//seller_id : 좋아요 누른사람 id
//saleinfo_id : 판매정보 id
router.get('/like', (req, res)=>{
  const sUser=req.session.sid;
 
  const queryStr=``;
  const value=[sUser];

  client.query(queryStr, value, (err, results) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(results.rows);
      }
      
     res.render('sale_list', {results : results.rows, logcheck : logcheck(req)});
  });  
})


//판매 현황(판매자중심)
router.get('/onprocess', function(req, res, next) {

  const sUser=getIdFromSession(req);

  const queryStr=`select * from saleinfo where buyer_id is not null and seller_id=$1
     order by sno desc`;
  const values=[sUser];

  client.query(queryStr, values, (err, results) => {
        if (err) {
          console.log(err.stack)
        } else {
          console.log(results.rows);
        }
        
       res.render('users_onprocess', {results : results.rows, logcheck : logcheck(req)});
  });  
});


//구매 현황(구매자 중심)
router.get('/purchased', (req, res)=>{

  var sUser;
  if(req.session.sid!=undefined){
    sUser=req.session.sid;
    }

  const queryStr=`select * from saleinfo where buyer_id=$1 order by sno desc `;
  
  const value=[sUser];

  client.query(queryStr, value, (err, results) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(results.rows);
      }
      
     res.render('users_onprocess', {results : results.rows, logcheck : logcheck(req)});
  });  
});





//seller_id : 좋아요 누른사람 id
//saleinfo_id : 판매정보 id
router.get('/reglist', (req, res)=>{

  var sUser;
  if(req.session.sid!=undefined){
    sUser=req.session.sid;
    }

  const queryStr=`select * from saleinfo where seller_id=$1 order by sno desc`

  //const sUser='id3';
  const value=[sUser];

  client.query(queryStr, value, (err, results) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(results.rows);
      }
      
     res.render('sale_list', {results : results.rows, logcheck : logcheck(req)});
  });  
})


//구매 확정된 것들 가져오기
router.get('/dealfixed', (req, res)=>{

  var sUser=getIdFromSession(req);

  const queryStr=`select * from saleinfo where seller_id=$1 and buyer_id is not null and process=1;`;
  
  const value=[sUser];

  client.query(queryStr, value, (err, results) => {
      if (err) {
        console.log(err.stack)
      } else {
        console.log(results.rows);
      }
      
     res.render('users_onprocess', {results : results.rows, logcheck : logcheck(req)});
  });  
});


module.exports = router;
