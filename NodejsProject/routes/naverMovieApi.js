const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const request=require('request');
const axios = require("axios");
const cheerio = require('cheerio');
const { Pool, Client } = require('pg')


const CLIENT_ID = "n0_0KcWBhI6j6VZH62xB";
const CLIENT_SERCRET = "aaTUtodscb";
const API_PATH = "https://openapi.naver.com/v1/search/movie.json";
const MOVIE_DETAIL_PATH = "https://movie.naver.com/movie/bi/mi/basic.nhn?code=70254";

const NYTIMES_BASEURL="https://api.nytimes.com/svc/search/v2/articlesearch.json"
const NYTIMES_API_KEY="5VssiK3hP68Qy7jyVV3aJ7vuU3uNSIYh"

const tempItems = [
  {
    title: "<b>아이언맨</b>",
    link: "https://movie.naver.com/movie/bi/mi/basic.nhn?code=123684",
    image:
      "https://ssl.pstatic.net/imgmovie/mdi/mit110/1236/123684_P00_161340.JPG",
    subtitle: "",
    pubDate: "2014",
    director: "김용수|",
    actor: "이동욱|신세경|김갑수|",
    userRating: "4.94"
  },
  {
    title: "<b>아이언맨</b> &amp; 캡틴 아메리카",
    link: "https://movie.naver.com/movie/bi/mi/basic.nhn?code=133519",
    image:
      "https://ssl.pstatic.net/imgmovie/mdi/mit110/1335/133519_P01_183929.jpg",
    subtitle: "Iron Man &amp; Captain America: Heroes United",
    pubDate: "2014",
    director: "",
    actor: "아드리안 패스더|로저 크레이그 스미스|",
    userRating: "9.00"
  },
  {
    title: "<b>아이언맨</b> 3",
    link: "https://movie.naver.com/movie/bi/mi/basic.nhn?code=70254",
    image:
      "https://ssl.pstatic.net/imgmovie/mdi/mit110/0702/70254_P35_153229.jpg",
    subtitle: "Iron Man 3",
    pubDate: "2013",
    director: "셰인 블랙|",
    actor:
      "로버트 다우니 주니어|기네스 팰트로|벤 킹슬리|돈 치들|가이 피어스|레베카 홀|",
    userRating: "8.86"
  },
  {
    title: "<b>아이언 맨</b>: 라이즈 오브 테크노보어",
    link: "https://movie.naver.com/movie/bi/mi/basic.nhn?code=106595",
    image:
      "https://ssl.pstatic.net/imgmovie/mdi/mit110/1065/106595_P01_175329.jpg",
    subtitle: "Iron Man: Rise of Technovore",
    pubDate: "2013",
    director: "하마사키 히로시|",
    actor: "후지와라 케이지|이리노 미유|",
    userRating: "3.28"
  },
  {
    title: "<b>아이언맨</b> &amp; 헐크",
    link: "https://movie.naver.com/movie/bi/mi/basic.nhn?code=133520",
    image:
      "https://ssl.pstatic.net/imgmovie/mdi/mit110/1335/133520_P01_182323.jpg",
    subtitle: "Iron Man &amp; Hulk: Heroes United",
    pubDate: "2013",
    director: "에릭 라돔스키|레오 릴리|",
    actor: "아드리안 패스더|프레드 타타시오르|",
    userRating: "4.00"
  },
  {
    title: "<b>아이언맨</b> 2",
    link: "https://movie.naver.com/movie/bi/mi/basic.nhn?code=49008",
    image:
      "https://ssl.pstatic.net/imgmovie/mdi/mit110/0490/49008_P52_162130.jpg",
    subtitle: "Iron Man 2",
    pubDate: "2010",
    director: "존 파브로|",
    actor:
      "로버트 다우니 주니어|기네스 팰트로|돈 치들|스칼렛 요한슨|미키 루크|",
    userRating: "7.36"
  },
  {
    title: "<b>아이언맨</b>",
    link: "https://movie.naver.com/movie/bi/mi/basic.nhn?code=44885",
    image: "https://ssl.pstatic.net/imgmovie/mdi/mit110/0448/D4885-01.jpg",
    subtitle: "Iron Man",
    pubDate: "2008",
    director: "존 파브로|",
    actor: "로버트 다우니 주니어|테렌스 하워드|제프 브리지스|기네스 팰트로|",
    userRating: "8.91"
  },
  {
    title: "인빈서블 <b>아이언 맨</b>",
    link: "https://movie.naver.com/movie/bi/mi/basic.nhn?code=66121",
    image: "https://ssl.pstatic.net/imgmovie/mdi/mit110/0661/F6121-01.jpg",
    subtitle: "The Invincible Iron Man",
    pubDate: "2007",
    director: "프랭크 포어|",
    actor: "마크 워든|구엔돌린 예오|",
    userRating: "7.24"
  },
  {
    title: "특수공작원 <b>아이언맨</b> - 시리즈",
    link: "https://movie.naver.com/movie/bi/mi/basic.nhn?code=74459",
    image:
      "https://ssl.pstatic.net/imgmovie/mdi/mit110/0744/74459_P04_205653.jpg",
    subtitle: "Cover Up",
    pubDate: "1984",
    director:
      "필 본델리|리처드 A. 콜라|피터 크레인|돈 칼로스 듀너웨이|월터 그루먼|존 D. 핸콕|제프리 헤이든|시드니 헤이어스|크리스토퍼 히블러|브루스 케슬러|가이 마거|버나드 맥이비티|아서 알랜 세이들먼|마이클 베자|돈 웨이스|",
    actor:
      "제니퍼 오닐|리차드 앤더슨|미켈티 윌리암슨|이레나 페리스|데이너 스파크스|잉그리드 앤더슨|데보라 러드윅 데이비스|존 에릭 히섬|",
    userRating: "7.63"
  },
  {
    title: "특수공작원 <b>아이언맨</b>",
    link: "https://movie.naver.com/movie/bi/mi/basic.nhn?code=74460",
    image: "",
    subtitle: "Cover Up",
    pubDate: "1984",
    director: "피터 크레인|",
    actor:
      "리차드 앤더슨|피터 브라운|메리 크로스비|캔디스 댈리|패트릭 고먼|존 에릭 히섬|",
    userRating: "9.00"
  }
];

const client = new Pool({
  user: "postgres",
  host: "petdeal-db.ckaysdqxrb6e.ap-northeast-2.rds.amazonaws.com",
  database: "postgres",
  password: "freesoul1712",
  multipleStatements: true,
  port: 5432
})


router.use(bodyParser.urlencoded({ extended: false }));


/**
 * 
 * 1. 클라이언트에서 POST 요청 들어옴
 * 2. 요청받은 객체 내의 검색객체 처리
 * 3. 검색 객체 이용하여 URL 생성 후 naver api 호출
 * 4. 응답 받아 클라이언트에 전달
 * 
 * 
 */

 // 영화 검색 api
router.post("/movie", async (req, res)=>{

  try{
   
    const request=req.query;
    
   
    const naverApiRes=await fetchMovieData(request);
    
    return res.json(naverApiRes.data.items);
    
  }catch(e){
    console.log(e);
    res.status(500).send("INTERNAL SERVER ERROR")
  }
})

//NAVER MOVIE API
const fetchMovieData=(queryObj)=>{
  
  queryObj.query = encodeURI(queryObj.query);



  const naverToken={
    headers:{
      "X-Naver-Client-Id": CLIENT_ID,
      "X-Naver-Client-Secret": CLIENT_SERCRET
    }
  }


  return axios.get(API_PATH+'?query=' + queryObj.query, naverToken );
  
}

const fetchNewsData=(query)=>{

  query='questions';

  const apiPath=`${NYTIMES_BASEURL}?api-key=${NYTIMES_API_KEY}&q=${query}`;

  return axios.get(apiPath)
  .then(response=>{
    return response.data.response.docs;
  })
  .catch(e=>{
    console.log(e)
  })
  
}

router.post("/getlist", async(req, res)=>{
  try{
    console.log(req.query)
    const response=await fetchNewsData(req.query);
    console.log("response-", response);

  }catch(e){
    console.log(e)
  }
})

//스크랩 추가
router.post("/scrap", (req, res)=>{
  try{

   console.log(req.body)
  let queryStr='INSERT INTO mylovemovie VALUES($1, $2, $3, $4, $5 ,$6 ,$7, $8, $9)';

  const params=[
    req.body.id,
    req.body.title,
    req.body.link,
    req.body.image,
    req.body.subtitle,
    req.body.pubDate,
    req.body.director,
    req.body.actor,
    req.body.userRating,
  ];

  client.query(queryStr, params, (err, result)=>{

  
    if(err){
      console.log(err.stack);
      console.log(result);
    }
  })

}catch(e){
  console.log(e)
}

})

//리스트 호출
router.get("/scrap", (req, res)=>{
  const queryStr='SELECT * FROM mylovemovie';

  client.query(queryStr, (err, result)=>{
    return res.json(result);
  })
})





//삭제
router.delete("/scrap/:id", (req, res)=>{

  try{
    console.log(req.params.id)
  
    const queryStr='DELETE FROM mylovemovie WHERE "ID"=$1';

    const param=[req.params.id];

    client.query(queryStr, param, (err, result)=>{
      console.log(result)
      return res.json(result);
    })

  }catch(e){
    console.log(e)
  }
})



module.exports = router;
