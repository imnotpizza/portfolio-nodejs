var express = require('express');
var router = express.Router();
const { Pool, Client } = require('pg')

const client = new Pool({
      user: "postgres",
      host: "petdeal-db.ckaysdqxrb6e.ap-northeast-2.rds.amazonaws.com",
      database: "postgres",
      password: "freesoul1712",
      multipleStatements: true,
      port: 5432
})

//세션에 저장된 id 반환, 저장되어있지 않으면 pleaselogin 반환
function getIdFromSession(req){
  var val;
  if(req.session.sid!=undefined){
    val=req.session.sid;
    return val;
  }else{
    return 'PleaseLogin';
  }
}

//로그인 여부 확인해 true/false 반환
function logcheck(req){
    console.log(req.session.sid+"  "+req.session.spw);
    if(req.session.sid!=null && req.session.spw!=null){
      return true;
      
    }else if(req.session.sid==undefined){
      console.log("@@@session nod@@@");
      return false;
    }
}

/**
 * RestApi, Ajax를 통한 스크랩 추가/삭제 구현부분
 */
//추가
router.post('/add/:sno', (req, res)=>{
    //console.log('add act');
    var sUser=getIdFromSession(req);

    const queryStr=`insert into userlike (buyer_id, saleinfo_id) values ($1, $2)`
    const values=[sUser, req.params.sno]

    client.query(queryStr, values, (err, results)=>{
       return;
    })
})
//삭제
router.delete('/delete/:sno', (req, res)=>{
    //console.log('delete act');
    var sUser=getIdFromSession(req);

    const queryStr=`delete from userlike where buyer_id=$1 and saleinfo_id=$2`
    const values=[sUser, req.params.sno]

    client.query(queryStr, values, (err, results)=>{
      return;
    })
})

router.get('/', (req, res)=>{
    var sUser=getIdFromSession(req);

    const queryStr=`select * from saleinfo where sno in
    (select saleinfo_id from userlike where buyer_id=$1)`

    const values=[sUser]

    client.query(queryStr, values, (err, results)=>{
        console.log('success');
        res.render('sale_list', {results : results.rows, logcheck : logcheck(req)})
    })
})


module.exports = router;