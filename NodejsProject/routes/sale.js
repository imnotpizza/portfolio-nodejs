var express = require('express');
var router = express.Router();
const { Pool, Client } = require('pg')

const client = new Pool({
      user: "postgres",
      //host: "database-2.ct6erzhsvszz.ap-northeast-2.rds.amazonaws.com",
      host: "petdeal-db.ckaysdqxrb6e.ap-northeast-2.rds.amazonaws.com",
      //host: "localhost",
      database: "postgres",
      password: "freesoul1712",
      multipleStatements: true,
      port: 5432
})

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
      return true;
      
    }else if(req.session.sid==undefined){
      console.log("@@@session nod@@@");
      return false;
    }
}


router.get('/aboutus', (req, res)=>{
  res.render('aboutus', {logcheck : logcheck(req)});
})


router.get('/', function(req, res, next) {
    const queryStr=`select * from saleinfo where buyer_id is null
       order by sno desc `;

    var sUser=getIdFromSession(req);
  
    client.query(queryStr, (err, results) => {
          if (err) {
            console.log(err.stack)
          } else {
            //console.log(results.rows[0].seller_id);
            
          }
          
         res.render('sale_list', {results : results.rows, logcheck : logcheck(req), sUser : sUser});
    });  
  });

router.get('/register', (req, res)=>{

  const sUser=getIdFromSession(req);
  
  res.render('sale_register', {logcheck : logcheck(req), sUser : sUser});
});

router.post('/register', (req, res)=>{

  const queryStr=`insert into saleinfo 
  (seller_id, pet_name, price, comment, status, petcode, title, process, avg_price, imgpath) 
  values($1, $2, $3, $4, $5 ,$6 ,$7, $8, $9, $10)`;
  const values=[req.body.seller_id ,
      req.body.pet_name ,
      req.body.price ,
      req.body.comment,
      req.body.status ,
      req.body.petcode ,
      req.body.title,
      0 ,
      25000,
      req.body.imgpath
   ];

  client.query(queryStr, values, (err, result) => {
    res.redirect('/sale');
  });
})

router.get('/:sno',(req, res)=>{

  var sid=getIdFromSession(req);

  const queryStr=`select users.*, saleinfo.* from 
  saleinfo left join users 
  on saleinfo.seller_id=users.id 
  where saleinfo.sno=$1`;

  const queryStr2=`select * from userlike where buyer_id=$1 and saleinfo_id=$2`
  
  values=[req.params.sno];
  values2=[sid, req.params.sno];

  

  client.query(queryStr, values, (err, results)=>{
    if(err){
      console.log('err');
    }else{
      client.query(queryStr2, values2, (err,results2)=>{
        var btChecked;

        btChecked=results2.rows.length==0 ? true : false;
        
        res.render('sale_read', {results : results.rows[0], logcheck : logcheck(req), sid : sid, btChecked : btChecked})
      })
      
    }
  
    
  });
});

router.get('/modify/:sno',(req, res)=>{
  var sid=getIdFromSession(req);

  const queryStr=`select users.*, saleinfo.* from 
  saleinfo left join users 
  on saleinfo.seller_id=users.id 
  where saleinfo.sno=$1`;

  const values=[req.params.sno];

  client.query(queryStr, values, (err, result)=>{
    //console.log(result);
    res.render('sale_modify', {result : result.rows[0], logcheck : logcheck(req), sid : sid});
  })

  
})


router.post('/modify', function(req, res){

  var sUser=getIdFromSession(req);

  const queryStr=`UPDATE public.saleinfo
	SET pet_name=$1, price=$2, comment=$3, status=$4, petcode=$5, title=$6, imgpath=$7
	WHERE sno=$8;`;
  
  values=[
    req.body.pet_name,
    req.body.price,
    req.body.comment,
    req.body.status,
    req.body.petcode,
    req.body.title,
    req.body.imgpath,    
    req.body.sno];

  client.query(queryStr, values, (err, result)=>{
     res.redirect('/sale');
  });
});




router.get('/delete/:sno', (req, res)=>{

  if(!req.params.sno){
      return res.status(400).json({error : 'id not found'});
  }

  const queryStr='delete from saleinfo where sno=$1';
  const values=[req.params.sno];


  client.query(queryStr,values, (err, result) => {
    res.redirect('/sale');
  });
  
})


//제목으로 검색하기
router.post('/s_bytitle', (req, res)=>{
  const queryStr=`select * from saleinfo where sno>0 
  and title like $1
  order by sno desc;`;

  //console.log(req.body.query);
  const value=['%'+req.body.query+'%'];

  client.query(queryStr, value, (err, results) => {
     res.render('sale_list', {results : results.rows, logcheck : logcheck(req)});
  });  
})



router.get('/purchase/:sno', (req, res)=>{

  
  var sUser=getIdFromSession(req);
  

  //salesinfo, seller 가져옴
  const queryStr_s=`select users.*, saleinfo.* from saleinfo
  left join users on saleinfo.seller_id=users.id 
  where saleinfo.sno=$1`;
  const value_s=[req.params.sno];
  
  //buyer가져옴
  var queryStr_b;
  var value_b;

  client.query(queryStr_s, value_s, (err, results_s) => {
      if (err) {
        console.log('error')
        console.log(err.stack)
      } else {
          
          console.log('buyer_id : '+results_s.rows[0].buyer_id);
          console.log('sUser : '+sUser);
          
          //buyer존재하는 경우-구매신청 들어간경우
          queryStr_b=`select * from users where id=$1`;
         
          
          if(results_s.rows[0].buyer_id!=null){
            value_b=[results_s.rows[0].buyer_id];
          }else{
          //아닌경우
            value_b=[sUser];
          }

          client.query(queryStr_b, value_b, (err, results_b) => {
              if (err) {
                console.log('error')
                console.log(err.stack)
              } else {
                  console.log(results_b.rows);
              } 
      
              res.render('sale_purchase', {
                results_s : results_s.rows[0], 
                results_b : results_b.rows[0], 
                logcheck : logcheck(req),
                sUser : sUser
              });
            
          });  
      } 
  });  
})

//구매요청

//구매 실행 버튼 클릭
router.get('/requestpurchase/:sno', (req, res)=>{

   var sUser=getIdFromSession(req);

   //salesinfo, seller 가져옴
   const queryStr=`update saleinfo set buyer_id=$1 where sno=$2`;
   const values=[sUser, req.params.sno];

   client.query(queryStr, values, (err, results) => {
    res.redirect('/users/purchased');
  });  
})

router.get('/acceptpurchase/:sno', (req, res)=>{
  
  
  const queryStr=`update saleinfo set process=1 where sno=$1`

  const value=[req.params.sno];

  client.query(queryStr, value, (err, results) => {

    res.redirect('/users/purchased');
  });  
})
  

module.exports = router;
