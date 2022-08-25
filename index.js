import express from "express"
import mysql from "mysql"
import path from "path"

//module타입 코딩에서는 __dirname이 정의되어있지않음, 수동으로 직접 정의
const __dirname = path.resolve()

//express 초기화
const app = express()
const port = 3000


//Mysql 연결설정
const connetion = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '0000',
    database : 'test'
})

connetion.connect()



app.post('/',function(req, res) {
    //res.send('Hello World!')

    connetion.query('select * from userinfo', function(error, row){
        if(error) throw error
        console.log('user info is:', row)
        res.send(row)
    })
})

app.get('/', function(req, res){
    res.send('hello world!')
})

app.get('/user', function(req, res){
    res.send(__dirname + '/seoul_kangnam_gu.json')
})

app.post('/user', function(req, res){

    //sendFile함수에서 파일경로를 절대경로를 요구함
    //__dirname으로 디렉토리까지의 절대경로를 가져옴
    res.sendFile(__dirname + '/seoul_kangnam_gu.json', function(error){
        if(error) throw error
        console.log('send image')
    })
})

app.listen(port, function() {
    console.log(`Example app listen on port ${port}`)
})