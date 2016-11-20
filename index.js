'Use strict'

module.exports = (() => {

  const readline = require('readline')
  const url = require('url')
  const path = require('path')
  const http = require('http')
  const Promise = require('bluebird')
  const fs = require('fs-extra')
  const request = require('request')

/**
 * 
 * Emtpies the given directory. If it doesn't exists it creates an empty one.
 * @param {any} dir The path to the given directory
 * @returns

 */
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

  /**
   * 
   * Return an array of urls retrieved from an input file
   * @param {any} origin The path to the input file
   * @returns
   */
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

  /**
   * 
   * Downloads to a destination all the ulrs given in an array
   * @param {any} images
   * @param {any} dest
   */
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

  /**
   * Given an url, get the name of the file 
   * 
   * @param {any} imgUrl
   * @returns
   */
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
