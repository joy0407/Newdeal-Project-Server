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
    password : 'Gjwjddbs1234',
    database : 'nunu'
})

//connetion.connect()
// social Test - kakao
app.use('/kakao', express.json())
app.post('/kakao',async (req,res)=>{
    console.log(req.body.id)
    let selectUser = await connetion.query(`SELECT id FROM users WHERE id = ?`,[req.body.id])
    if (selectUser[0] === undefined){
       connection.query(`INSERT INTO users(id, email, nickname) VALUES (?,?,?)`,[req.body.id,req.body.kakao_account.email, req.body.properties.nickname],(err,res)=>{
         console.log('Hello New Kakao Member!')
       })
     }
     else{
       console.log('Kakao login success')
    }
});
app.use('/naver', express.json())
app.post('/naver',(req,res)=>{
    console.log(req.body)
});

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

//-----------------------------------------------------
//프로젝트용 소스코드


//express 서버 실행
app.listen(port, function () {
    console.log(`Example app listen on port ${port}`)
})


//날씨 응답
app.post('/weather/dailyWeather', function (req, res) {
    res.sendFile(__dirname + '/dailyWeather.json')
    console.log('send daily weather file')
})




//지도 기반 유저 물고기 사진 띄우기
app.post('/mapFish/userBase', function (req, res) {
    //여러개의 이미지 파일 한번에 전송하기

    let zip = new JSZip()

    zip.file("image.jpg", fs.readFileSync(__dirname + '/image.jpg'))

    //zip 파일 생성 in nodejs
    //참조링크 : https://stuk.github.io/jszip/documentation/howto/write_zip.html
    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream('test.zip'))
        .on('finish', function () {
            console.log('zip file written')
        })

    res.sendFile(__dirname + '/test.zip')
})





async function runPythonLength(path)
{
    return await new Promise(resolve => {
        let option = {
            mode : 'text',
            pythonPath : '',
            pythonOptions : ['-u'],
            scripPath : '',
            args : [path],
            encoding : 'utf8'
        }
    
        let returnData = {}
    
        pythonShell.PythonShell.run('checkFishLength.py', option, function(err, result){
            if(err) console.log(err)
            else {
                let data = result
                //let text = data.toString('utf-8')
                //console.log('run')
                //console.log(data)
    
                console.log('height ' + data[0].split(':')[1].replaceAll(' ', '').replaceAll('cm',''))
                console.log('width' + data[1].split(':')[1].replaceAll(' ', '').replaceAll('cm',''))
    
                returnData.height = data[0].split(':')[1].replaceAll(' ', '').replaceAll('cm','')
                returnData.width = data[1].split(':')[1].replaceAll(' ', '').replaceAll('cm','')
            
                //return resolve(result)
                //return returnData
                return resolve(returnData)
            }
        })
    
        // pythonShell.PythonShell.run('checkFishType.py', option, function(err, result){
        //     if(err) console.log(err)
        //     else {
        //         let data = result
        //         //let text = data.toString('utf-8')
        //         //console.log('run')
        //         //console.log(data)
    
        //         console.log(data[2].split(':')[1])
        //         returnData.type = data[2].split(':')[1]
        //     }
        // })
    
        console.log("await end")
        
    })
}

async function runPythonType(path) {
    return await new Promise(resolve => {
        let option = {
            mode : 'text',
            pythonPath : '',
            pythonOptions : ['-u'],
            scripPath : '',
            args : [path],
            encoding : 'utf8'
        }
    
        let returnData = {}
    
        // pythonShell.PythonShell.run('checkFishLength.py', option, function(err, result){
        //     if(err) console.log(err)
        //     else {
        //         let data = result
        //         //let text = data.toString('utf-8')
        //         //console.log('run')
        //         //console.log(data)
    
        //         console.log(data[0].split(':')[1].replaceAll(' ', '').replaceAll('cm',''))
        //         console.log(data[1].split(':')[1].replaceAll(' ', '').replaceAll('cm',''))
    
        //         returnData.height = data[0].split(':')[1].replaceAll(' ', '').replaceAll('cm','')
        //         returnData.width = data[1].split(':')[1].replaceAll(' ', '').replaceAll('cm','')
            
        //         //return resolve(result)
        //         //return returnData
        //         return resolve(returnData)
        //     }
        // })
    
        pythonShell.PythonShell.run('checkFishType.py', option, function(err, result){
            if(err) console.log(err)
            else {
                let data = result
                //let text = data.toString('utf-8')
                //console.log('run')
                //console.log(data)
    
                console.log(data[2].split(':')[1])
                returnData.type = data[2].split(':')[1]

                return resolve(returnData)
            }
        })
    
        console.log("await end")
        
    })
}

//물고기 종류, 길이 판정 수신, 전송

//물고기 정보 수신, echo로 되돌려줌

//파일처리를 위한 multer모듈 설정
const upload = multer({ dest: 'uploads/' })
const cpUpload = upload.fields([{ name: 'fish', maxCount: 1 }])

//물고기 정보 수신 and 송신
app.post('/matchFish/caculateData', cpUpload, async function (req, res) {

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

    //let data = fs.readFileSync(newPath, "base64")


    let data = fs.readFileSync(newPath, function (err) {
        if (err) throw err
    })

    // result.stdout.on('data', function(data) {
    //     console.log(data.toString(''))
    // })

    // result.stderr.on('data', function(data) {
    //     console.log(data.toString() + ' err')
    // })

    let pythonDataLength = await runPythonLength(newPath)
    let pythonDataType = await runPythonType(newPath)

    //console.log(pythonData)
    console.log("test")
    //console.log(pythonData)

    // let option = {
    //     mode : 'text',
    //     pythonPath : '',
    //     pythonOptions : ['-u'],
    //     scripPath : '',
    //     args : [req.files['fish'][0].path + '.jpg'],
    //     encoding : 'utf8'
    // }

    // pythonShell.PythonShell.run('checkFishLength.py', option, function(err, result){
    //     if(err) console.log(err)
    //     else {
    //         let data = result
    //         //let text = data.toString('utf-8')
    //         //console.log('run')
    //         //console.log(data)

    //         console.log(data[0].split(':')[1].replaceAll(' ', '').replaceAll('cm',''))
    //         console.log(data[1].split(':')[1].replaceAll(' ', '').replaceAll('cm',''))
    //     }
    // })

    // pythonShell.PythonShell.run('checkFishType.py', option, function(err, result){
    //     if(err) console.log(err)
    //     else {
    //         let data = result
    //         //let text = data.toString('utf-8')
    //         //console.log('run')
    //         //console.log(data)

    //         console.log(data[2].split(':')[1])
    //     }
    // })

    // let length = Math.random() * 100
    //let fishType = '열대어'
    let imageName = req.files['fish'][0].path + '.jpg'

    let length = parseFloat(pythonDataLength.height) > parseFloat(pythonDataLength.width) ? pythonDataLength.height : pythonDataLength.width
    let fishType = pythonDataType.type

    //length = length.toFixed(2).toString() + 'cm'
    imageName = imageName.split('\\')[1]
    //console.log(imageName)


    // connetion.query('insert into catchFishData (user, fishType, fishLength, latitude, longitude, imagePath) values (?,?,?,?,?,?)', ['test', fishType, length, location.latitude, location.longitude, imageName], function(err, row, filed) {
    //     if(err) console.log(err)
    // })

    //res.send(data)

    //send base64
    //let sendData = new Buffer.from(data).toString("base64")
    //console.log(sendData)
    //res.send(sendData)

   
    

    let sendData = {}

    sendData.fishType = fishType
    sendData.fishLength = length
    sendData.imageData = new Buffer.from(data).toString("base64")

    res.send(sendData)
    //send pack blob
    // console.log(data)
    // let blob = new Blob([data], {type:'image/jpeg'})
    // console.log(blob)

    // //물고기사진 전송

    // res.type(blob.type)
    // blob.arrayBuffer().then((buf) =>{
    //     res.send(Buffer.from(buf))
    // })

    //send raw binaly
    //res.sendFile(newPath)
})

app.get('/matchFish/caculateData', function (req, res) {
    let image = __dirname + '/image.jpg'
    res.sendFile(image)

    console.log('send image')
})

//text filed 테스트, x-www-form-urlencoded형태의 데이터를 인식
app.use('/matchFish.receiveData', express.json())
app.use('/matchFish/receiveData', express.urlencoded({ extended: true }))
app.post('/matchFish/receiveData', function (req, res) {
    console.log('for body test')

    console.log(req.body)

    res.send(req.body)
})


// rank전송용
app.use('/rank/fish', express.json())
app.use('/rank/fish', express.urlencoded({extended : true}))
app.post('/rank/fish', function (req, res) {
    console.log('rankFish')

    let data = []

    console.log(req.body)

    if(req.body.fishType == '참돔')
    {
        data.push({ 'rank': 1, 'length': 15 })
        data.push({ 'rank': 2, 'length': 14 })
        data.push({ 'rank': 3, 'length': 13 })
        data.push({ 'rank': 4, 'length': 12 })
    }
    else
    {
        data.push({ 'rank': 10, 'length': 51 })
        data.push({ 'rank': 11, 'length': 41 })
        data.push({ 'rank': 12, 'length': 31 })
        data.push({ 'rank': 13, 'length': 21 })
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
    //console.log(sendData)
    res.send(sendData)
})

app.use('/map/center', express.json())
app.use('/map/center', express.urlencoded({ extended: true }))
app.post('/map/center', async function (req, res) {
    console.log('mapCenter')

    let data = req.body

    console.log(data.Ma + ' ' + data.La) 

    //get position data for database with data, get image Path list

    let [selectData] = await connetion.query('select * from catchFishData')

    //insert select data to sendData
    let sendData= []

    for(let i=0;i<selectData.length;i++){
        let packData = {}

        //let filePath = __dirname + '/image' + i + '.jpg'
        let filePath = __dirname + '/uploads/' + selectData[i].imagePath
        let imageData = fs.readFileSync(filePath, function(err) {
            if(err) throw err
        })

        //packData.latitude = data.La
        //packData.longitude = data.Ma
        //packData.fishType = '열대어'
        //packData.fishLength = (Math.random() * 100).toFixed(1).toString() + 'cm'
        
        packData.latitude = selectData[i].latitude
        packData.longitude = selectData[i].longitude
        packData.fishType = selectData[i].fishType
        packData.fishLength = selectData[i].fishLength
        packData.image = new Buffer.from(imageData).toString("base64")

        console.log(i)

        sendData.push(packData)
    }

    console.log('end')

    //sendData.push(data)

    res.send(sendData)
})
