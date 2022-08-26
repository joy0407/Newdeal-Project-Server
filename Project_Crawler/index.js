import { createJsonFile, getData, goto, init } from "./crawler.js"

const main = async function(){

    await init()

    await getData()

    await createJsonFile()
}

main()