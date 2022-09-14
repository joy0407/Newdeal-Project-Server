import express from "express"
import mysql from "mysql2/promise"
import path from "path"
import multer from "multer"
import fs from "fs"
import JSZip from "jszip"
import cors from  "cors"
import pythonShell from "python-shell"


//module타입 코딩에서는 __dirname이 정의되어있지않음, 수동으로 직접 정의
const __dirname = path.resolve()

//express 초기화
const app = express()
const port = 3000


// accesss allow url list (CORS : 통신 프로토콜이 서로 다를때 헤더에 담아 허가해줌) 
// 다음 함수 실행으로 header 에 Access-Control-Allow-Origin:'https://nunutest.shop' 데이터를 서브해 줄 클라이언트
app.use(cors({
    origin: 'https://nunutest.shop',
    credentials: true, 
  }));

// app.use(cors({
//     origin :'http://localhost:8080'
// }))



// Mysql 연결설정
const connetion = await mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : ''
})

connetion.connect()

// social Test - kakao
app.use('/kakao', express.json())
app.post('/kakao',async (req,res)=>{
    console.log(req.body.properties.thumnail_image)
    let selectUser = await connetion.query(`SELECT id FROM users WHERE id = ?`,[req.body.id])
    if (selectUser[0][0] === undefined){
       let connection = await mysql.createConnection({host: 'localhost',user: 'root',password: '',database: ''})
       connection.connect()
       
       await connection.query(`INSERT INTO users(id, email, nickname, provider) VALUES (?,?,?,?)`,[req.body.id,req.body.kakao_account.email, req.body.properties.nickname, 'kakao'])
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
app.post('/naver',(req,res)=>{
    console.log(req.body)
    res.send('naver!!')
});
//-----------------------------------------------------
//프로젝트용 소스코드

//express 서버 실행
app.listen(port, function () {
    console.log(`Example app listen on port ${port}`)
})

//날씨 응답
app.use('/weather/dailyWeather', express.json())
app.use('/weather/dailyWeather', express.urlencoded({extended : true}))
app.post('/weather/dailyWeather', function (req, res) {

    let location = req.body.location
    let data = []

    let jsonFileData = fs.readFileSync('./Project_Crawler/dailyWeather.json')
    let jsonData = JSON.parse(jsonFileData)

    location = location.replaceAll(' ','')

    for(let i=0;i<jsonData.length;i++)
    {
        if(location == jsonData[i].location)
        {
            data.push(jsonData[i])
        }
    }

    //console.log(data)
    // data.push({"location":"서해북부앞바다","day":"26일(금)","weather":"비","time":"오후","windDir":"북서-북","windSpeed":"4~9","seaHeight":"0.5~1"})
    // data.push({"location":"서해북부앞바다","day":"27일(토)","weather":"맑음","time":"오전","windDir":"북서-북","windSpeed":"5~9","seaHeight":"0.5~0.5"})
    // data.push({"location":"서해북부앞바다","day":"27일(토)","weather":"맑음","time":"오후","windDir":"서-북서","windSpeed":"5~8","seaHeight":"0.5~1"})
    // data.push({"location":"서해북부앞바다","day":"28일(일)","weather":"구름많음","time":"오전","windDir":"북-북동","windSpeed":"3~6","seaHeight":"0.5~0.5"})
    // data.push({"location":"서해북부앞바다","day":"28일(일)","weather":"흐림","time":"오후","windDir":"서-북서","windSpeed":"2~4","seaHeight":"0.5~0.5"})

    res.send(data)
    //res.sendFile(__dirname + '/dailyWeather.json')
    console.log('send daily weather file')
})


//물고기 종류, 길이 판정 수신, 전송
//물고기 정보 수신, echo로 되돌려줌

//파일처리를 위한 multer모듈 설정
const upload = multer({ dest: 'uploads/' })
const cpUpload = upload.fields([{ name: 'fish', maxCount: 1 }])

//물고기 정보 수신 and 송신
app.post('/matchFish/caculateData', cpUpload, warp(async function (req, res) {

    console.log("receive image file data")

    //file 이름과 확장자를 재정의, 전달받을시 파일형식이 존재하지않음
    let oldPath = __dirname + '/' + req.files['fish'][0].path
    let newPath = __dirname + '/' + req.files['fish'][0].path + '.jpg'

    let location = {
        latitude : 0,
        longitude : 0
    }

    location.latitude = req.body.latitude
    location.longitude = req.body.longitude

    console.log(location)

    fs.renameSync(oldPath, newPath, function(error){
        if(error) throw error
    })

    let data = fs.readFileSync(newPath, function (err) {
        if (err) throw err
    })

    let pythonDataLength = await runPythonLength(newPath)
    let pythonDataType = await runPythonType(newPath)

    console.log("caculate Fish is done")

    let imageName = req.files['fish'][0].path + '.jpg'
    let length = parseFloat(pythonDataLength.height) > parseFloat(pythonDataLength.width) ? pythonDataLength.height : pythonDataLength.width
    let fishType = pythonDataType.type

    imageName = imageName.split('\\')[1]

    // connetion.query('insert into catchFishData (user, fishType, fishLength, latitude, longitude, imagePath) values (?,?,?,?,?,?)', ['test', fishType, length, location.latitude, location.longitude, imageName], function(err, row, filed) {
    //     if(err) console.log(err)
    // })

    let sendData = {}

    sendData.fishType = fishType
    sendData.fishLength = length
    sendData.imageData = new Buffer.from(data).toString("base64")

    res.send(sendData)
    console.log("send data")
}))

// rank전송용
app.use('/rank/fish', express.json())
app.use('/rank/fish', express.urlencoded({extended : true}))
app.post('/rank/fish', function (req, res) {
    console.log('rankFish')

    let data = []

    console.log(req.body)

    if(req.body.fishType == '참돔')
    {
        data.push({ 'rank': 1, 'id': 'test1', 'length': 15, 'grade' : 'A' })
        data.push({ 'rank': 2, 'id': 'test2', 'length': 14, 'grade' : 'B' })
        data.push({ 'rank': 3, 'id': 'test3', 'length': 12, 'grade' : 'D' })
        data.push({ 'rank': 4, 'id': 'test4', 'length': 10, 'grade' : 'E' })
    }
    else if(req.body.fishType == '돌돔')
    {
        data.push({ 'rank': 21, 'id': 'test1', 'length': 51, 'grade' : 'A' })
        data.push({ 'rank': 31, 'id': 'test2', 'length': 41, 'grade' : 'B' })
        data.push({ 'rank': 41, 'id': 'test3', 'length': 21, 'grade' : 'C' })
        data.push({ 'rank': 51, 'id': 'test4', 'length': 15, 'grade' : 'F' })
    }
    else if(req.body.fishType == '감성돔')
    {
        data.push({ 'rank': 15, 'id': 'test1', 'length': 33, 'grade' : 'A' })
        data.push({ 'rank': 17, 'id': 'test2', 'length': 31, 'grade' : 'B' })
        data.push({ 'rank': 19, 'id': 'test3', 'length': 29, 'grade' : 'C' })
        data.push({ 'rank': 21, 'id': 'test4', 'length': 27, 'grade' : 'D' })
    }
    else if(req.body.fishType == '조피볼락')
    {
        data.push({ 'rank': 10, 'id': 'test1', 'length': 22, 'grade' : 'A' })
        data.push({ 'rank': 11, 'id': 'test2', 'length': 21, 'grade' : 'A' })
        data.push({ 'rank': 12, 'id': 'test3', 'length': 20, 'grade' : 'A' })
        data.push({ 'rank': 13, 'id': 'test4', 'length': 18, 'grade' : 'B' })
    }
    else if(req.body.fishType == '넙치')
    {
        data.push({ 'rank': 31, 'id': 'test1', 'length': 29, 'grade' : 'A' })
        data.push({ 'rank': 33, 'id': 'test2', 'length': 26, 'grade' : 'C' })
        data.push({ 'rank': 36, 'id': 'test3', 'length': 22, 'grade' : 'E' })
        data.push({ 'rank': 38, 'id': 'test4', 'length': 15, 'grade' : 'F' })
    }
    else
    {
        data.push({ 'rank': 1, 'id': 'err1', 'length': 15, 'grade' : 'A' })
        data.push({ 'rank': 2, 'id': 'err2', 'length': 14, 'grade' : 'B' })
        data.push({ 'rank': 3, 'id': 'err3', 'length': 12, 'grade' : 'D' })
        data.push({ 'rank': 4, 'id': 'err4', 'length': 10, 'grade' : 'E' })
    }


    res.send(data)
})

// map전송 테스트
app.get('/map/fish', function (req, res) {
    console.log('mapFish')

    //use image Path list

    let filePath = __dirname + '/image.jpg'
    let data = fs.readFileSync(filePath, function (err) {
        if (err) throw err
    })

    let sendData = new Buffer.from(data).toString("base64")

    res.send(sendData)
})

app.use('/map/center', express.json())
app.use('/map/center', express.urlencoded({ extended: true }))
app.post('/map/center', async function (req, res) {
    
    let data = req.body

    console.log('map Center : ' + data.Ma + ' ' + data.La) 

    //get position data for database with data, get image Path list

    let [selectData] = await connetion.query('select * from catchFishData')

    //insert select data to sendData
    let sendData= []

    for(let i=0;i<selectData.length;i++){
        let packData = {}

        //if(parseFloat(selectData[i].latitude) )
        if(caculateLocation(data.Ma, data.La, selectData[i].latitude, selectData[i].longitude)) {

            //let filePath = __dirname + '/image' + i + '.jpg'
            let filePath = __dirname + '/uploads/' + selectData[i].imagePath
            let imageData = fs.readFileSync(filePath, function(err) {
                if(err) throw err
            })
            
            packData.latitude = selectData[i].latitude
            packData.longitude = selectData[i].longitude
            packData.fishType = selectData[i].fishType
            packData.fishLength = selectData[i].fishLength
            packData.image = new Buffer.from(imageData).toString("base64")

            sendData.push(packData)
        }
    }

    res.send(sendData)
    console.log('send MapFishData')
})

