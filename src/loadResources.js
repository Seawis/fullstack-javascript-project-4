import axios from 'axios'
import fsp from 'fs/promises'

import { pathToDashed } from './loadPaths.js'
import axiosErrors from './axiosErrors.js'

export default (cheerioData, p) => {
  const linked = {
    img: 'src',
    link: 'href',
    script: 'src',
  }

  const removeHostname = (str) => {
    if (typeof str !== 'string') return str
    const prefix = p.url.hostname.replace(/[^a-zA-Z0-9]+/g, '-')
    return str.startsWith(prefix) ? str.slice(prefix.length).replace(/^-+|-+$/g, '') : str
  }

  for (const resource of Object.keys(linked)) {
    cheerioData(resource).each((i, elem) => {
      const oldSrc = cheerioData(elem).attr(linked[resource])
      const newUrl = new URL(oldSrc, p.url)
      if (oldSrc && (p.url.hostname === newUrl.hostname)) {
        const fileName = removeHostname(pathToDashed(oldSrc))
        const newSrc = `${p.dirName}/${fileName}`

        cheerioData(elem).attr(linked[resource], newSrc)
        axios.get(newUrl, { responseType: 'stream' })
          .then(response => fsp.writeFile(`${p.dirPath}/${fileName}`, response.data))
          .catch(err => axiosErrors(err, oldSrc))

        console.log(oldSrc)
      }
    })
  }
  console.log('All files was loaded!')
  return cheerioData
}
