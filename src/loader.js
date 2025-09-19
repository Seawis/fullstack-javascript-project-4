import axios from 'axios'
import fsp from 'fs/promises'
import * as cheerio from 'cheerio'

import { pathForUrl } from './loadPaths.js'
import axiosErrors from './axiosErrors.js'
import loadResources from './loadResources.js'

const loader = (url, outputDir) => {
  const p = pathForUrl(url, outputDir)

  fsp.mkdir(p.fullDirPath)
    .catch(err => console.log(err))

  return axios.get(url)
    .then(response => cheerio.load(response.data))
    .catch(err => axiosErrors(err, url))
    .then($ => loadResources($, p))
    .then(fixed$ => fixed$.html())
    .then(newHtml => fsp.writeFile(p.filePath, newHtml))
}

export default loader
