import axios from 'axios'
import fsp from 'fs/promises'
import * as cheerio from 'cheerio'
import debug from 'debug'
// import axiosDebug from 'axios-debug-log'

import { pathForUrl } from './loadPaths.js'
import { axiosErrors, savingErrors } from './handlingErrors.js'
import loadResources from './loadResources.js'
/*
// конфигурация логирования
axiosDebug({
  request: function (debug, config) {
    debug('Request with ' + config.headers['content-type'])
  },
  response: function (debug, response) {
    debug(
      'Response with ' + response.headers['content-type'],
      'from ' + response.config.url,
    )
  },
  error: function (debug, error) {
    // Read https://www.npmjs.com/package/axios#handling-errors for more info
    debug('Boom', error)
  },
})
*/
const log = debug('page-loader')

const loader = (url, outputDir) => {
  log('"loader" started')
  const p = pathForUrl(url, outputDir)

  fsp.mkdir(p.fullDirPath)
    .then(() => log('Created forder: ' + p.fullDirPath))
    .catch(savingErrors)

  return axios.get(url)
    .then(response => cheerio.load(response.data))
    .catch(err => axiosErrors(err, url))
    .then($ => loadResources($, p))
    .then(fixed$ => fsp.writeFile(p.filePath, fixed$.html()))
    .then(() => log('Created file: ' + p.filePath))
}

export default loader
