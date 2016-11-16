const imgDownloader = require('./img-downloader')
const path = require('path')
const url = require('url')

let filePath = path.join(__dirname, 'images.txt')
let downloadFolder = path.join(__dirname, 'imgDownloads')

imgDownloader.init(filePath, downloadFolder)
