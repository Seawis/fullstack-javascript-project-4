import axios from 'axios'
import fsp from 'fs/promises'
import debug from 'debug'

import { pathToDashed } from './loadPaths.js'
import { axiosErrors, savingErrors } from './handlingErrors.js'

const log = debug('page-loader-res')

export default (cheerioData, p) => {
  const linked = {
    img: 'src',
    link: 'href',
    script: 'src',
  }

  for (const resource of Object.keys(linked)) {
    log(`loading "${resource}"`)

    cheerioData(resource).each((i, elem) => {
      const oldSrc = cheerioData(elem).attr(linked[resource])
      const newUrl = new URL(oldSrc, p.url)
      const fileName = pathToDashed(oldSrc, p.url.hostname)

      if (oldSrc && (p.url.hostname === newUrl.hostname) && fileName !== null) {
        const newSrc = `${p.dirName}/${fileName}`

        log(`change "${oldSrc}" to "${newSrc}"`)
        cheerioData(elem).attr(linked[resource], newSrc)

        return axios.get(newUrl, { responseType: 'stream' })
          .then(response => fsp.writeFile(`${p.dirPath}/${fileName}`, response.data)
            .catch(savingErrors))
          .catch(err => axiosErrors(err, oldSrc))
        // console.log(fileName, oldSrc)
      }
    })
  }
  console.log('All files was loaded!')
  return cheerioData
}
