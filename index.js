import express from "express"
import mysql from "mysql2/promise"
import path from "path"
import multer from "multer"
import fs from "fs"
import cors from  "cors"
import {runPythonLength, runPythonType} from "./pythonJS.js"
import {caculateLocation} from "./functionJS.js"


//module타입 코딩에서는 __dirname이 정의되어있지않음, 수동으로 직접 정의
const __dirname = path.resolve()

//express 초기화
const app = express()
const port = 3000

// accesss allow url list (CORS : 통신 프로토콜이 서로 다를때 헤더에 담아 허가해줌) 
// 다음 함수 실행으로 header 에 Access-Control-Allow-Origin:'https://nunutest.shop' 데이터를 서브해 줄 클라이언트
// app.use(cors({
//     origin: 'https://nunutest.shop',
//     credentials: true, 
//   }));

app.use(cors({
    origin :'http://localhost:8080'
}))



//Mysql 연결설정
const connetion = await mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '0000',
    database : 'test'
})

// connetion.connect()

// social Test - kakao
app.use('/kakao', express.json())
app.post('/kakao',(req,res)=>{
    console.log(req.body)
    console.log(req.body.properties)
    res.send(req.body.properties.nickname)
});

app.use('/naver', express.json())
app.post('/naver',(req,res)=>{
    console.log(req.body)
});

//await/async error핸들링용 warp함수
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
//테스트용 입력

// app.post('/',function(req, res) {
//     //res.send('Hello World!')
//     connetion.query('select * from userinfo', function(error, row){
//         if(error) throw error
//         console.log('user info is:', row)
//         res.send(row)
//     })
// })

// app.get('/', function(req, res){
//     res.send('hello world!')
// })

// app.post('/user/image', function(req, res){
//     res.sendFile(__dirname + '/image.jpg', function(error){
//         if(error) throw error
//         console.log('send image')
//     })
// })

// app.post('/user', function(req, res){

//     //sendFile함수에서 파일경로를 절대경로를 요구함
//     //__dirname으로 디렉토리까지의 절대경로를 가져옴
//     res.sendFile(__dirname + '/seoul_kangnam_gu.json', function(error){
//         if(error) throw error
//         console.log('send image')
//     })
// })

// //text filed 테스트, x-www-form-urlencoded형태의 데이터를 인식
// app.use('/matchFish.receiveData', express.json())
// app.use('/matchFish/receiveData', express.urlencoded({ extended: true }))
// app.post('/matchFish/receiveData', function (req, res) {
//     console.log('for body test')

//     console.log(req.body)

//     res.send(req.body)
// })

// //지도 기반 유저 물고기 사진 띄우기
// app.post('/mapFish/userBase', function (req, res) {
//     //여러개의 이미지 파일 한번에 전송하기

//     let zip = new JSZip()

//     zip.file("image.jpg", fs.readFileSync(__dirname + '/image.jpg'))

//     //zip 파일 생성 in nodejs
//     //참조링크 : https://stuk.github.io/jszip/documentation/howto/write_zip.html
//     zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
//         .pipe(fs.createWriteStream('test.zip'))
//         .on('finish', function () {
//             console.log('zip file written')
//         })

//     res.sendFile(__dirname + '/test.zip')
// })

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

    connetion.query('insert into catchFishData (user, fishType, fishLength, latitude, longitude, imagePath) values (?,?,?,?,?,?)', ['test', fishType, length, location.latitude, location.longitude, imageName], function(err, row, filed) {
        if(err) console.log(err)
    })

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
        data.push({ 'rank': 1, 'thumbnail': 'http://k.kakaocdn.net/dn/UszZG/btrIwHjbElA/M7yq5NODhTHnQBYNXDo6TK/img_110x110.jpg', 'id': 'sol', 'length': 15, 'grade' : 'A' })
        data.push({ 'rank': 2, 'thumbnail': 'https://phinf.pstatic.net/contact/20210909_185/1631194079809JVxB2_JPEG/KakaoTalk_20200727_123406631.jpg', 'id': '정유니', 'length': 14, 'grade' : 'B' })
        data.push({ 'rank': 3, 'thumbnail': null, 'id': 'test3', 'length': 12, 'grade' : 'D' })
        data.push({ 'rank': 4, 'thumbnail': 'https://ssl.pstatic.net/static/pwe/address/img_profile.png', 'id': 'test4', 'length': 10, 'grade' : 'E' })
    }
    else if(req.body.fishType == '돌돔')
    {
        data.push({ 'rank': 1, 'thumbnail': 'http://k.kakaocdn.net/dn/UszZG/btrIwHjbElA/M7yq5NODhTHnQBYNXDo6TK/img_110x110.jpg', 'id': 'sol', 'length': 15, 'grade' : 'A' })
        data.push({ 'rank': 2, 'thumbnail': 'https://phinf.pstatic.net/contact/20210909_185/1631194079809JVxB2_JPEG/KakaoTalk_20200727_123406631.jpg', 'id': '정유니', 'length': 14, 'grade' : 'B' })
        data.push({ 'rank': 3, 'thumbnail': null, 'id': 'test3', 'length': 12, 'grade' : 'D' })
        data.push({ 'rank': 4, 'thumbnail': 'https://ssl.pstatic.net/static/pwe/address/img_profile.png', 'id': 'test4', 'length': 10, 'grade' : 'E' })
    }
    else if(req.body.fishType == '감성돔')
    {
        data.push({ 'rank': 1, 'thumbnail': 'http://k.kakaocdn.net/dn/UszZG/btrIwHjbElA/M7yq5NODhTHnQBYNXDo6TK/img_110x110.jpg', 'id': 'sol', 'length': 15, 'grade' : 'A' })
        data.push({ 'rank': 2, 'thumbnail': 'https://phinf.pstatic.net/contact/20210909_185/1631194079809JVxB2_JPEG/KakaoTalk_20200727_123406631.jpg', 'id': '정유니', 'length': 14, 'grade' : 'B' })
        data.push({ 'rank': 3, 'thumbnail': null, 'id': 'test3', 'length': 12, 'grade' : 'D' })
        data.push({ 'rank': 4, 'thumbnail': 'https://ssl.pstatic.net/static/pwe/address/img_profile.png', 'id': 'test4', 'length': 10, 'grade' : 'E' })
    }
    else if(req.body.fishType == '조피볼락')
    {
        data.push({ 'rank': 1, 'thumbnail': 'http://k.kakaocdn.net/dn/UszZG/btrIwHjbElA/M7yq5NODhTHnQBYNXDo6TK/img_110x110.jpg', 'id': 'sol', 'length': 15, 'grade' : 'A' })
        data.push({ 'rank': 2, 'thumbnail': 'https://phinf.pstatic.net/contact/20210909_185/1631194079809JVxB2_JPEG/KakaoTalk_20200727_123406631.jpg', 'id': '정유니', 'length': 14, 'grade' : 'B' })
        data.push({ 'rank': 3, 'thumbnail': null, 'id': 'test3', 'length': 12, 'grade' : 'D' })
        data.push({ 'rank': 4, 'thumbnail': 'https://ssl.pstatic.net/static/pwe/address/img_profile.png', 'id': 'test4', 'length': 10, 'grade' : 'E' })
    }
    else if(req.body.fishType == '넙치')
    {
        data.push({ 'rank': 1, 'thumbnail': 'http://k.kakaocdn.net/dn/UszZG/btrIwHjbElA/M7yq5NODhTHnQBYNXDo6TK/img_110x110.jpg', 'id': 'sol', 'length': 15, 'grade' : 'A' })
        data.push({ 'rank': 2, 'thumbnail': 'https://phinf.pstatic.net/contact/20210909_185/1631194079809JVxB2_JPEG/KakaoTalk_20200727_123406631.jpg', 'id': '정유니', 'length': 14, 'grade' : 'B' })
        data.push({ 'rank': 3, 'thumbnail': null, 'id': 'test3', 'length': 12, 'grade' : 'D' })
        data.push({ 'rank': 4, 'thumbnail': 'https://ssl.pstatic.net/static/pwe/address/img_profile.png', 'id': 'test4', 'length': 10, 'grade' : 'E' })
    }
    else
    {
        data.push({ 'rank': 1, 'thumbnail': 'http://k.kakaocdn.net/dn/UszZG/btrIwHjbElA/M7yq5NODhTHnQBYNXDo6TK/img_110x110.jpg', 'id': 'sol', 'length': 15, 'grade' : 'A' })
        data.push({ 'rank': 2, 'thumbnail': 'https://phinf.pstatic.net/contact/20210909_185/1631194079809JVxB2_JPEG/KakaoTalk_20200727_123406631.jpg', 'id': '정유니', 'length': 14, 'grade' : 'B' })
        data.push({ 'rank': 3, 'thumbnail': null, 'id': 'test3', 'length': 12, 'grade' : 'D' })
        data.push({ 'rank': 4, 'thumbnail': 'https://ssl.pstatic.net/static/pwe/address/img_profile.png', 'id': 'test4', 'length': 10, 'grade' : 'E' })
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
