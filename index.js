import express from "express"
import mysql from "mysql2/promise"
import path from "path"
import multer from "multer"
import fs from "fs"
import cors from  "cors"
import os from "os"
import {runPythonLength, runPythonType, runPythonGrade} from "./pythonJS.js"
import {caculateLocation} from "./functionJS.js"
import dbConfig from "./config/db.config.js"
import elsConfig from "./config/els.config.js"

//module타입 코딩에서는 __dirname이 정의되어있지않음, 수동으로 직접 정의
const __dirname = path.resolve()

//express 초기화
const app = express();
const port = 3000

// accesss allow url list (CORS : 통신 프로토콜이 서로 다를때 헤더에 담아 허가해줌) 
// 다음 함수 실행으로 header 에 Access-Control-Allow-Origin:'https://nunutest.shop' 데이터를 서브해 줄 클라이언트
app.use(cors({
    origin: 'https://nunutest.shop',
    credentials: true, 
  }));

//Mysql 연결설정
let options = {
    host:dbConfig.host,
    port:dbConfig.port,
    user:dbConfig.user,
    password:dbConfig.password,
    database:dbConfig.database
  }
const connection = await mysql.createConnection(options)
connection.connect()
// app.use(cors({
//     origin :'http://localhost:8080'
// }))

// social login
app.use('/kakao', express.json())
app.post('/kakao',async (req,res)=>{
    let selectUser = await connection.query(`SELECT id FROM users WHERE id = ?`,[req.body.id])
    if (selectUser[0][0] === undefined){
       //let connection = await mysql.createConnection(options)
       //connection.connect()
       
       await connection.query(`INSERT INTO users(id, email, nickname,thumbnail, provider) VALUES (?,?,?,?,?)`,[req.body.id,req.body.kakao_account.email, req.body.properties.nickname, req.body.properties.thumbnail_image,'kakao'])
       console.log('Hello! Kakao new member')
     }
     else{
       console.log('Kakao login success')
    }
    let data = {
        id: req.body.id,
        nickname: req.body.properties.nickname,
        thumbnail: req.body.properties.thumbnail_image
    }
    res.send(data)
});
app.use('/naver', express.json())
app.post('/naver',async (req,res)=>{
    let selectUser = await connection.query(`SELECT id FROM users WHERE id = ?`,[req.body.id])
    if (selectUser[0][0] === undefined){
       //let connection = await mysql.createConnection(options)
       //connection.connect()
       
       await connection.query(`INSERT INTO users(id, email, nickname,thumbnail, provider) VALUES (?,?,?,?,?)`,[req.body.id,req.body.email, req.body.nickname,req.body.profile_image, 'naver'])
       console.log('Hello! Naver new member')
     }
     else{
       console.log('Kakao Naver success')
    }
    let data = {
        id: req.body.id,
        nickname: req.body.nickname,
        thumbnail: req.body.profile_image
    }
    res.send(data)
});

//await&async error핸들링용 warp함수
const warp = function(fn) {
    return async function(res, req, next) {
        try{
            await fn(res, req, next)
        }
        catch(err){
            next(err)
        }
    }
}

//-------------------------------------------------
app.get('/', function(req, res){
    res.send("Server is Running")
})

//-----------------------------------------------------
//프로젝트용 소스코드

//express 서버 실행
app.listen(port, function () {
    console.log(`Example app listen on port ${port}`)
    console.log(os.platform())
})

//날씨 응답
app.use('/weather/dailyWeather', express.json())
app.use('/weather/dailyWeather', express.urlencoded({extended : true}))
app.post('/weather/dailyWeather', function (req, res) {

    console.log("=========================")
    console.log("Request Weather Data")
    //조회할 위치 가져오기
    let location = req.body.location
    let data = []

    //미리 크롤링해둔 Json파일 읽어오기, Json형태로 사용할수 있도록 파싱
    //let jsonFileData = fs.readFileSync('./dailyWeather.json')
    let jsonFileData = fs.readFileSync('./Project_Crawler/dailyWeather.json')
    let jsonData = JSON.parse(jsonFileData)

    //위치데이터 가공, 크롤링한 파일에는 공백이 전부 제거된 상태이므로 공백을 제거
    location = location.replaceAll(' ','')

    //전송할 데이터 선택, 전송할 데이터 리스트 생성
    for(let i=0;i<jsonData.length;i++)
    {
        if(location == jsonData[i].location)
        {
            data.push(jsonData[i])
        }
    }

    res.send(data)
    console.log('Send Daily Weather File')
})


//물고기 종류, 길이 판정 수신, 전송
//물고기 정보 수신, echo로 되돌려줌

//파일처리를 위한 multer모듈 설정
const upload = multer({ dest: 'uploads/' })
const cpUpload = upload.fields([{ name: 'fish', maxCount: 1 }])

//물고기 정보 수신 and 송신
app.post('/matchFish/caculateData', cpUpload, warp(async function (req, res) {

    console.log("=========================")
    console.log("Receive Image File Data")

    //file 이름과 확장자를 재정의, 전달받을시 파일형식이 존재하지않음
    let oldPath = __dirname + '/' + req.files['fish'][0].path
    let newPath = __dirname + '/' + req.files['fish'][0].path + '.jpg'

    let location = {
        latitude : 0,
        longitude : 0
    }

    //전송받은 위치데이터 저장
    location.latitude = req.body.latitude
    location.longitude = req.body.longitude

    //전송받은 파일이름 재정의
    fs.renameSync(oldPath, newPath, function(error){
        if(error) throw error
    })

    //재정의한 이미지파일 읽어오기
    let data = fs.readFileSync(newPath, function (err) {
        if (err) throw err
    })

    //파이썬 모듈을 이용한 물고기 종류판별 및 길이측정, 해당모듈이 전체코드실행시간에 영향
    let pythonDataLength //= await runPythonLength(newPath)
    let pythonDataType //= await runPythonType(newPath)

    await Promise.all([runPythonLength(newPath), runPythonType(newPath)])
    .then(function(value){

        pythonDataLength = value[0]
        pythonDataType = value[1]
    })

    console.log("Caculate Fish is Done")

    //데이터베이스에 저장하기위한 작업
    //이미지는 파일이름만 다시 정의, 물고기의 길이는 반환된 길이중 가장 긴 길이를 사용
    let imageName = req.files['fish'][0].path + '.jpg'
    let length = parseFloat(pythonDataLength.height) > parseFloat(pythonDataLength.width) ? pythonDataLength.height : pythonDataLength.width
    let fishType = pythonDataType.type
    let userName = req.body.userId

    //폴더제거를 위한 코드, os별 파일경로가 조금씩 다름
    if(os.platform() == 'win32')
        imageName = imageName.split('\\')[1]
    else
        imageName = imageName.split('/')[1]

    //물고기 등급판별을 위한 파이썬 코드
    let pythonDataGrade = await runPythonGrade(fishType, length)
    console.log('Fish Grade is : ', pythonDataGrade )

    //F등급은 놓아줘야할 등급이라 따로 저장하지않음
    if(pythonDataGrade != 'F')
    {
        connection.query('insert into catchFishData (user, fishType, fishLength, latitude, longitude, imagePath, grade) values (?,?,?,?,?,?,?)', [userName, fishType, length, location.latitude, location.longitude, imageName, pythonDataGrade], function(err, row, filed) {
            if(err) console.log(err)
        })
        console.log("Insert Database is Done")
    }


    //최종연산된 결과물 전송
    let sendData = {}

    sendData.fishType = fishType
    sendData.fishLength = length
    sendData.imageData = new Buffer.from(data).toString("base64") //웹페이지에서 사용하기 편한 Base64로 인코딩 후 전송

    res.send(sendData)
    console.log("Send Fish Type And Lenght Data")
}))

// rank전송용
app.use('/rank/fish', express.json())
app.use('/rank/fish', express.urlencoded({extended : true}))
app.post('/rank/fish', async function (req, res) {

    console.log("=========================")
    console.log('Request RankFish')

    let data = []

    //데이터베이스에서 전제 데이터 가져오기 (데이터가 적은갯수라 가능, 많으면 랭크 테이블 생성 필요)
    //let [selectData] = await connetion.query('select * from catchFishData where fishType=' + '\'' + req.body.fishType + '\'')
    let [selectData] = await connection.query('select * from catchFishData inner join users on catchFishData.user = users.id where catchFishData.fishType =' + '\'' + req.body.fishType + '\'')

    //데이터 정렬, 랭크테이블 생성하면 필요없을 수 있음
    selectData.sort(function(a, b){
        if(a.fishLength > b.fishLength) return -1
        if(a.fishLength < b.fishLength) return 1
        if(a.fishLength == b.fishLength) return 0
    })

    //전송할 데이터 배열로 입력
    for(let i=0;i<selectData.length;i++)
    {
        data.push({'rank' : i+1, 'id' : selectData[i].user, 'thumbnail' : selectData[i].thumbnail, 'length' : parseInt(selectData[i].fishLength), 'grade' : selectData[i].grade})
    }

    res.send(data)
    console.log("Rank Data Send")
})

app.use('/map/center', express.json())
app.use('/map/center', express.urlencoded({ extended: true }))
app.post('/map/center', async function (req, res) {
    
    console.log("=========================")
    console.log("Request Map Fish Data")

    let data = req.body

    console.log('map Center : ' + data.Ma + ' ' + data.La) 

    //데이터베이스에서 전체 데이터 조회
    let [selectData] = await connection.query('select * from catchFishData')

    //전송할 데이터 선별
    let sendData= []

    for(let i=0;i<selectData.length;i++){
        let packData = {}

        //받아온 중심좌표를 기준으로 일정거리내(0.5)의 데이터만 선별, 갯수제한을 따로 두고있지않음
        if(caculateLocation(data.Ma, data.La, selectData[i].latitude, selectData[i].longitude)) {

            //이미지데이터 가져오기
            let filePath = __dirname + '/uploads/' + selectData[i].imagePath
            let imageData = fs.readFileSync(filePath, function(err) {
                if(err) throw err
            })
            
            packData.latitude = selectData[i].latitude
            packData.longitude = selectData[i].longitude
            packData.fishType = selectData[i].fishType
            packData.fishLength = selectData[i].fishLength
            packData.image = new Buffer.from(imageData).toString("base64") //웹페이지에서 사용하기 편한 Base64로 인코딩 후 전송

            sendData.push(packData)
        }
    }

    res.send(sendData)
    console.log('Send MapFishData')
})

// elasticsearch
import els from '@elastic/elasticsearch';
let cli = {
    node:elsConfig.node,
    auth:elsConfig.auth
}
const client = new els.Client(cli)

app.get('/search', (req,res)=>{
async function run() {
                const result=await client.search({
                    index: 'fish',
                    query: {
                        // localhost:3000/search?q=
                        match: {"어종": req.query['q']}
                    }
                })
            res.send(result.hits.hits)
            console.log(result.hits.hits)
        }
    run().catch(console.log)
});
