import pythonShell from "python-shell"
import os from "os"

//파이썬 모듈을 실행시키기위한 파일
//비동기로 실행되므로 결과물을 받기까지 대기하기 위해 Promise를 정의
//파이썬의 Print로 출력된 결과물을 결과로 저장해 가져옴, 가져온 데이터를 가공하는 과정이 존재함

//물고기 길이를 반환하는 모듈
async function runPythonLength(path)
{
    return new Promise(resolve => {
        let option = {
            mode : 'text',
            pythonPath : '',
            pythonOptions : ['-u'],
            scripPath : '',
            args : [path], //물고기 이미지 파일 경로
            encoding : 'utf8'
        }
    
        let returnData = {}
    
        pythonShell.PythonShell.run('checkFishLength.py', option, function(err, result){
            if(err) console.log(err)
            else {
                let data = result
    
                //가져온 데이터에서 필요없는 데이터를 제거함, 제거된 결과로는 숫자만 결과로 출력됨
                //자바스크립트 특성상 필요시 숫자 혹은 문자로 변환 필요, 해당 함수에서는 변환하지않음
                returnData.height = data[0].split(':')[1].replaceAll(' ', '').replaceAll('cm','')
                returnData.width = data[1].split(':')[1].replaceAll(' ', '').replaceAll('cm','')

                return resolve(returnData)
            }
        })   
    })
}

//물고기를 판별하는 모듈
async function runPythonType(path) {
    return new Promise(resolve => {
        let option = {
            mode : 'text',
            pythonPath : '',
            pythonOptions : ['-u'],
            scripPath : '',
            args : [path], //물고기 이미지 파일 경로
            encoding : 'utf8'
        }
    
        let returnData = {}

        pythonShell.PythonShell.run('checkFishType.py', option, function(err, result){
            if(err) console.log(err)
            else {
                let data = result

                //실행환경에 따라 리턴되는 값이 달라짐
                //윈도우는 실행줄이 2개, 데이터출력이 1개
                //리눅스(우분투)는 실행줄1개(이스케이프시퀸스가 중간에 출력됨), 데이터출력이 1개
                if(os.platform() == 'win32')
                    returnData.type = data[2].split(':')[1]
                else
                    returnData.type = data[1].split(':')[1]

                return resolve(returnData)
            }
        })
    })
}

//물고기의 등급을 측정하는 모듈
async function runPythonGrade(type, length)
{
    return new Promise(resolve => {
        let option = {
            mode : 'text',
            pythonPath : '',
            pythonOptions : ['-u'],
            scripPath : '',
            args : [type, length], //물고기 타입, 물고기 길이
            encoding : 'utf8'
        }
    
        let returnData

        pythonShell.PythonShell.run('fish_rank.py', option, function(err, result){
            if(err) console.log(err)
            else {
                let data = result

                //반환되는 값은 S, A, B, C, D, E, F 로 이들중 하나가 반환됨
                returnData = data[0]

                return resolve(returnData)
            }
        })
    })
}

export{
    runPythonLength,
    runPythonType,
    runPythonGrade
}