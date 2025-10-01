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
const loader = async (url, outputDir) => {
  log('"loader" started')
  const p = pathForUrl(url, outputDir)

  fsp.mkdir(p.fullDirPath)
    .catch(savingErrors)
    .then(() => log('Created forder: ' + p.fullDirPath))

  return axios.get(url)
    .then(response => response.data)
    .catch(err => axiosErrors(err, url))
    .then(html => loadResources(html, p))
    .then(([fixedHtml, filepaths]) => {
      fsp.writeFile(p.filePath, fixedHtml)
        .catch(savingErrors)
        .then(() => log('Created file: ' + p.filePath))
      return writeFiles(filepaths)
    })
}
*/

async function loader(url, outputDir) {
  log('"loader" started')
  const p = pathForUrl(url, outputDir)

  try {
    await fsp.mkdir(p.fullDirPath).catch(savingErrors)
    log('Created forder: ' + p.fullDirPath)

    const html = await axios.get(url)
      .then(res => res.data)
      .catch(err => axiosErrors(err, url))

    const [fixedHtml, filepaths] = await loadResources(html, p)

    await fsp.writeFile(p.filePath, fixedHtml).catch(savingErrors)
    log('Created file: ' + p.filePath)
    await writeFiles(filepaths)

    return { ok: true, filePath: p.filePath, dir: p.fullDirPath }
  }
  catch (err) {
    return { ok: false, error: err }
  }
}

export default loader
