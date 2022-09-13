import pythonShell from "python-shell"

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
    
                returnData.height = data[0].split(':')[1].replaceAll(' ', '').replaceAll('cm','')
                returnData.width = data[1].split(':')[1].replaceAll(' ', '').replaceAll('cm','')

                return resolve(returnData)
            }
        })   
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

        pythonShell.PythonShell.run('checkFishType.py', option, function(err, result){
            if(err) console.log(err)
            else {
                let data = result

                returnData.type = data[2].split(':')[1]

                return resolve(returnData)
            }
        })
    })
}

export{
    runPythonLength,
    runPythonType
}