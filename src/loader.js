import axios from 'axios'
import fsp from 'fs/promises'

import { pathForUrl } from './filePaths.js'

const loader = (url, outputDir) => {
  const filePath = pathForUrl(url, outputDir)
  return axios.get(url)
    .then(response => fsp.writeFile(filePath, response.data))
    .then(() => filePath)
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
}

export default loader
