/**
 * Created by Cesar on 15/11/2016.
 */
module.exports = (function () {
  'Use strict'

  const fs = require('fs')
  const readline = require('readline')
  const request = require('request')
  const url = require('url')
  const path = require('path')
  const http = require('http')

  function deleteImages (dir) {
    return new Promise((resolve, reject) => {
      // fs.emptyDir(directory, (err) => {
      //   if (err) {
      //     reject(err)
      //   }
      //
      //   resolve()
      //
      // })
      resolve(dir)
    })
  }

  function getImages (origin) {
    const lineReader = readline.createInterface({
      input: fs.createReadStream(origin)
    })

    return new Promise((resolve) => {
      let images = []

      lineReader.on('line', (line) => images.push(line))

      lineReader.on('close', () => resolve(images))
    })
  }

  function download (url, dest, callback) {
    let filename = extractFileNameFromUrl(url)
    request.head(url, (err, res, body) => {
      request(url)
        .pipe(
          fs.createWriteStream(path.join(dest, filename))
        )
        .on('close', callback)

      // if (res.statusCode < 200 ||res.statusCode > 299)
      //   reject(new Error('Failed to load image, status code: ' + res.statusCode))

      // res.on('end', function () {
      //   resolve(image)
      // })
    })
  }

  function extractFileNameFromUrl (imgUrl) {
    let parsedUrl = url.parse(imgUrl)
    return path.basename(parsedUrl.pathname)
  }

  function init (origin, dest) {
    // First we delete the image directory
    deleteImages(dest)
    .then((result) => {
      console.log(result)
    })
    // Then we get the images
    .then((result) => {
      return getImages(origin)
    })
    // Then we proceed to download them one by one
    .then(function (result) {
      result.forEach((imgUrl) => download(imgUrl, dest, () => console.log('done')))
    })
  }

  return {
    init: init
  }
})()
