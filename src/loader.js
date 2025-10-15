import axios from 'axios'
import fsp from 'fs/promises'
import debug from 'debug'
// import axiosDebug from 'axios-debug-log'

import { pathForUrl } from './loadPaths.js'
import { axiosErrors, savingErrors } from './handlingErrors.js'
import loadResources from './loadResources.js'
import writeFiles from './writeFiles.js'
/*
// конфигурация логирования axios
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
/*
const loader = (url, outputDir) => {
  log('"loader" started')
  const p = pathForUrl(url, outputDir)

  fsp.mkdir(p.fullDirPath)
    .then(() => log('Created forder: ' + p.fullDirPath))
    .catch(savingErrors)

  return axios.get(url)
    .then(response => response.data)
    .then(html => loadResources(html, p))
    .then(([fixedHtml, filePaths]) => {
      writeFiles(filePaths)
      return fsp.writeFile(p.filePath, fixedHtml)
        .then(() => log('Created file: ' + p.filePath))
        .catch(savingErrors)
    })
    .catch(err => axiosErrors(err, url))
}
*/

const loader = async (url, outputDir) => {
  const p = pathForUrl(url, outputDir)
  log(`"loader" started, ${url}, ${outputDir}, ${p.fullDirPath}`)
  // console.log(process.cwd())
  await fsp.mkdir(p.fullDirPath).catch(savingErrors) // , { recursive: true }
  log('Created forder: ' + p.fullDirPath)

  const html = await axios.get(url)
    .then(res => res.data)
    .catch(err => axiosErrors(err, url))

  if (typeof html === 'string') {
    const [fixedHtml, filePaths] = loadResources(html, p)

    try {
      await fsp.access(p.fullDirPath)

      await fsp.writeFile(p.filePath, fixedHtml).catch(savingErrors)
      log('Created file: ' + p.filePath)
      await writeFiles(filePaths)
    }
    catch {
      console.error('cannot access')
    }
  }
}

export default loader
