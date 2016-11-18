/**
 * Created by Cesar on 15/11/2016.
 */
module.exports = (() => {
  'Use strict'

  const readline = require('readline')
  const url = require('url')
  const path = require('path')
  const http = require('http')
  const Promise = require('bluebird')
  const fs = require('fs-extra')
  const request = require('request')

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

  function download (images, dest) {
    Promise.each(images, image => new Promise((resolve, reject) => {
      let filename = extractFileNameFromUrl(image)
      console.log('Downloading Image: ' + filename)
      request(image).on('error', reject).pipe(fs.createWriteStream(path.join(dest, filename))).on('finish', () => {
          console.log('Downloaded Image: ' + filename)
          resolve()
      })
    })).then(() => {
        console.log('All images Downloaded!')
    }).catch(err => {
        console.error('Failed: ' + err.message)
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
    })
    .catch((error) => {
      console.log(error)
    })
    // Then we get the images
    .then(() => {
      return getImages(origin)
    })
    .catch((error) => {
      console.log(error)
    })
    // Then we proceed to download them one by one
    .then((images) => {
      download(images, dest)
    })
    .catch((err) => {
      console.log(err)
    })
  }

  return {
    init: init
  }
})()
