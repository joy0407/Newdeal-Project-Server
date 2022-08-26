import puppeteer from "puppeteer-core"
import os from "os"
import wait from "wwait"
import { time } from "console"
import { fstat } from "fs"
import fs from "fs"

const macUrl = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
//'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const whidowsUrl = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
const currentOs = os.type()
const launchConfig = {
	headless: false,
	defaultViewport: null,
	ignoreDefaultArgs: ['--disable-extensions'],
	args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-notifications', '--disable-extensions'],
	executablePath: currentOs == 'Darwin' ? macUrl : whidowsUrl
}


let browser = null
let page = null
let dailyWeatherList = []

const init = async function() {

    browser = await puppeteer.launch(launchConfig)
    let pages = await browser.pages()

    page = pages[0]

    await page.goto("https://www.weather.go.kr/w/ocean/forecast/daily-forecast.do")

    
}

const goto = async function(url) {
    //document.querySelectorAll("body > div.container > section > div > div:nth-child(3) > div.cont-box03 > div > div.img-con > div.img-area1.on > div > * > button")
    //document.querySelectorAll("body > div.container > section > div > div:nth-child(3) > div.cont-box03 > div > div.img-con > div.img-area1.on > div > * > * > button")
}

const waitData = async function(button){
    let text1
    let text2
    let text3
    let text4
    do{
        button.click()
    
        //데이터 불러올때까지 대기
        text1 = document.querySelector("#sea-today-mid-term > h3 > strong").innerText.replaceAll('[','').replaceAll(']','').replaceAll(' ','')
        text2 = document.querySelector("#sea-today-short-term-title > h3 > strong").innerText.replaceAll('[','').replaceAll(']','').replaceAll(' ','')
        text3 = button.innerText.replaceAll('\n','')
        text4 = document.querySelector("#sea-today-short-term > div.over-scroll > table > caption").innerText.split(' ')[0].replace('[','').replace(']','').replace(' ','')

    }while(text1 == text2 == text3 == text4)
    console.log("done!")
}

const getData = async function() {

    await page.waitForSelector("#sea-today-short-term > div.over-scroll > table > tbody")

    //dailyWeatherList
    let buttonList = []
    let weatherList = []
    let weatherDataList = []


    for(let i=2;i<11;i++)
    {
        let path = `body > div.container > section > div > div:nth-child(3) > div.cont-box03 > div > div.img-con > div.img-area${i} > div > button`

        buttonList = await page.evaluate(function(path){

            let buttonList = document.querySelectorAll(path)
            return buttonList
        }, path)
        
        for(let j=0;j<Object.keys(buttonList).length;j++)
        {
            await page.evaluate(function(j, path){
                let buttonList = document.querySelectorAll(path)
                buttonList[j].click()
            },j, path)
            

            await page.waitForTimeout(1000)


            weatherList = await page.evaluate(function(j, path){
                let weatherDataList = []
                let weatherData = []
                let buttonList = document.querySelectorAll(path)
                let location = buttonList[j].innerText.replaceAll('\n', ' ').replaceAll(' ', '')
                let weatherList = document.querySelectorAll("#sea-today-short-term > div.over-scroll > table > tbody > tr")

                let count = 0
                if(weatherList.length % 2 == 1)
                {
                    let frist = weatherList[count].innerText.split('\t')
    
                    let day = frist[0].split('\n')[0]
                    let weather = frist[0].split('\n')[1]
                    let time = frist[1]
                    let windDir = frist[2]
                    let windSpeed = frist[3]
                    let seaHeight = frist[4]
    
                    weatherData = { location, day, weather, time, windDir, windSpeed, seaHeight}
                    weatherDataList.push(weatherData)
    
                    count = 1
                }

                for(let k = count; k < weatherList.length; k = k+2 )
                {
                    let frist = weatherList[k].innerText.split('  ')
                    let second = weatherList[k+1].innerText.split('  ')
    
    
    
                    //오전부분 크롤링
                    let day = frist[0].split('\n')[0]
                    let weather = frist[0].split('\n')[1]
                    let time = frist[1].split('\t')[1]
                    let windDir = frist[1].split('\t')[2]
                    let windSpeed = frist[1].split('\t')[3]
                    let seaHeight = frist[1].split('\t')[4]
                        
                    weatherData = { location, day, weather, time, windDir, windSpeed, seaHeight}
    
                    //save data
                    //console.log(weather1)
                    weatherDataList.push(weatherData)
    
                    //오후부분 크롤링
                    weather = frist[1].split('\t')[0]
                    time = second[0].split('\t')[0]
                    windDir = second[0].split('\t')[1]
                    windSpeed = second[0].split('\t')[2]
                    seaHeight = second[0].split('\t')[3]
    
                    //save data
                    weatherData = { location, day, weather, time, windDir, windSpeed, seaHeight}
                    weatherDataList.push(weatherData)
                }

                return weatherDataList

            },j, path)

            weatherDataList = weatherDataList.concat(weatherList)

        }
    }

    dailyWeatherList = weatherDataList

    console.log(dailyWeatherList.length)
}

const getDetailData = async function(urlList) {

    await page.evaluate(function() {

    })
}

const createJsonFile = async function() {

    let finalData = []

    finalData = finalData.concat(dailyWeatherList)

    let stringData = JSON.stringify(finalData)

    await fs.writeFileSync('./dailyWeather.json', stringData)

    page.close()
}



export {
    init,
    goto,
    getData,
    createJsonFile

}