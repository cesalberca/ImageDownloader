/**
 * Created by Cesar on 15/11/2016.
 */
module.exports = (function () {
  'Use strict'

  const readline = require('readline')
  const url = require('url')
  const path = require('path')
  const http = require('http')
  const Promise = require('bluebird')
  const fs = Promise.promisifyAll(require('fs-extra'))
  const request = Promise.promisifyAll(require('request'))

  function deleteImagesDirectory (dir) {
    return new Promise((resolve, reject) => {
      fs.emptyDir(dir, (err) => {
        if (err)
          reject(err)
        else
          resolve(`${dir} is now empty`)
      })
    })
  }

  function getImages (origin) {
    const lineReader = readline.createInterface({
      input: fs.createReadStream(origin)
    })

    return new Promise((resolve, reject) => {
      let images = []
      lineReader.on('line', (line) => images.push(line))
      lineReader.on('error', () => reject(new Error('Error while reading the file')))
      lineReader.on('close', () => resolve(images))
    })
  }

  function download (url, dest) {
    return new Promise((resolve, reject) => {
      let filename = extractFileNameFromUrl(url)

      request.head(url, (err, response, body) => {
        request(url).pipe(fs.createWriteStream(path.join(dest, filename)))

        if (response.statusCode < 200 || response.statusCode > 299)
          reject(new Error(`Failed to load image, status code: ${response.statusCode}`))
        else
          resolve(`Done downloading ${filename}`)
      })
    })
  }

  function extractFileNameFromUrl (imgUrl) {
    let parsedUrl = url.parse(imgUrl)
    return path.basename(parsedUrl.pathname)
  }

  function init (origin, dest) {
    // First we delete the image directory
    deleteImagesDirectory(dest)
    .then((result) => {
      console.log(result)
    }).catch((error) => {
      console.log(error)
    })
    // Then we get the images
    .then((result) => {
      return getImages(origin)
    }).catch((error) => {
      console.log(error)
    })
    // Then we proceed to download them one by one
    .then((result) => {
      result.forEach((imgUrl) => download(imgUrl, dest))
    }).catch((error) => {
      console.log(error)
    }).then((result) => {
      console.log(`Download finished`)
    })
  }

  return {
    init: init
  }
})()
