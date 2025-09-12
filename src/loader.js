import axios from 'axios'
import fsp from 'fs/promises'
import * as cheerio from 'cheerio'

import { pathForUrl, pathToDashed } from './loadPaths.js'
import axiosErrors from './axiosErrors.js'

const loader = (url, outputDir) => {
  const p = pathForUrl(url, outputDir)

  return axios.get(url)
    .then(response => response.data)
    .catch((error) => {
      if (error.response) {
        throw new Error(error.response.status)
      }
      else if (error.request) {
        throw new Error(error.request)
      }
      else {
        throw new Error(error.message)
      }
    })
    .then((responseData) => {
      const $ = cheerio.load(responseData)

      fsp.mkdir(p.fullDirPath)
        .catch(err => console.log(err)) // Forder is already created or cannot create!

        .then(() => {
          $('img').each((i, elem) => {
            const oldSrc = $(elem).attr('src')

            if (oldSrc) {
              const fileName = pathToDashed(oldSrc) // p.nameOfSite + ...
              const newSrc = `${p.dirName}/${fileName}`
              $(elem).attr('src', newSrc)

              const oldSrcURL = new URL(oldSrc, url)
              axios.get(oldSrcURL, { responseType: 'stream' })
                .then(response => fsp.writeFile(`${p.dirPath}/${fileName}`, response.data))
                .catch(axiosErrors)
            }
          })
        })
      return $.html()
    })
    .then(newHtml => fsp.writeFile(p.filePath, newHtml))
    // .then(() => p.filePath)
}

export default loader
