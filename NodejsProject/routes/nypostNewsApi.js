const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const request = require("request");
const axios = require("axios");
const { Pool, Client } = require("pg");

const NYTIMES_BASEURL = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
const NYTIMES_API_KEY = "5VssiK3hP68Qy7jyVV3aJ7vuU3uNSIYh";
const NYTIMES_THUMBNAIL_BASEURL = "https://www.nytimes.com/"

const BASE_URL = `${NYTIMES_BASEURL}?api-key=${NYTIMES_API_KEY}`;



const client = new Pool({
    user: "postgres",
    host: "petdeal-db.ckaysdqxrb6e.ap-northeast-2.rds.amazonaws.com",
    database: "postgres",
    password: "freesoul1712",
    multipleStatements: true,
    port: 5432
  })


router.use(bodyParser.urlencoded({ extended: false }));


//검색 결과 리스트 반환
router.post("/search", async (req, res) => {
  try {
    //const scrapList=await fetchScrapData(); - 스크랩 되었는지 판별 후 반환
    console.log("### page search : "+req.query.query);
    const response = await fetchNewsData(req.query.query, req.query.pageNum);
    
    return res.json(response);

  } catch (e) {
    console.log(e);
    res.status(500).send("INTERNAL SERVER ERROR")
  }
});


//news api 호출
const fetchNewsData = (query, pageNum) => {
 
  const apiPath = `${BASE_URL}&q=${query}&page=${pageNum}`;

  //api 호출
  return axios.get(apiPath)
    .then((response) => {

      let newsList= response.data.response.docs;

      //새 객체 만들어 반환
      return newsList.map((news, id)=>{
         
        //이미지 없으면 디폴트 이미지 반환
          let _thumbnail=(news.multimedia.length===0 ? 
            'https://myportfolio-resources.s3.ap-northeast-2.amazonaws.com/newsimg-default.jpg' : 
            NYTIMES_THUMBNAIL_BASEURL+news.multimedia[0].url
            );


        //키워드 배열 추출
        let _keywords=(news.keywords.map(keyword=>{
            return keyword.value;
        }))
        _keywords=_keywords.join('|');
        

        let _id=news._id.split('nyt://article/')[1];

          return{
              id: _id,//ID
              title: news.headline.main,//제목
              abstract: news.abstract,//요약기사
              pubdate:news.pub_date,//작성일
              img: _thumbnail,//이미지 url
              url: news.web_url,//기사 경로
              keywords: _keywords,
              section: `${news.news_desk}-${news.section_name}`,//기사 분류
              isScrap: false,//스크랩 여부
          }
      })
    })
    .catch((e) => {
      console.log(e);
    });
};


//스크랩

// 리스트 호출
router.get("/scrap", (req, res) => {
  const queryStr = "SELECT * FROM newsscrap";

  client.query(queryStr, (err, result) => {
     
    return res.json(result);
  });
});


//스크랩 삭제
router.delete("/scrap/:id", (req, res)=>{

    try{
      
      
      const queryStr='delete from newsscrap where "id"=$1';
  
      const param=[req.params.id];
  
      client.query(queryStr, param, (err, result)=>{
        console.log(result)
        return res.json(result);
      })
  
    }catch(e){
      console.log(e)
    }
  })

//스크랩 추가
router.post("/scrap", (req, res)=>{
    
    try{
        console.log(req.body)

        const queryStr='insert into newsscrap values($1, $2, $3, $4, $5 ,$6 ,$7, $8)';

        const params=[  
            req.body.id,
            req.body.title,
            req.body.abstract,
            req.body.pubdate,
            req.body.img,
            req.body.url,
            req.body.keywords,
            req.body.section,
        ];

        client.query(queryStr, params, (err, result)=>{
            res.status(200).send("SUCCESS");
        })
    }catch(e){
        console.log(e)
        res.status(500).send("INTERNAL SERVER ERROR");
    }
})

module.exports = router;