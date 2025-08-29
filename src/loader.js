import axios from 'axios'
import fsp from 'fs/promises'

import { pathForUrl } from './filePaths.js'

const loader = (url, outputDir) => {
  const filePath = pathForUrl(url, outputDir) // path.join(outputDir, makeFileName(url))
  axios.get(url)
    .then(response => fsp.writeFile(filePath, response.data))
    .then(() => console.log(filePath))
    .catch(error => console.log(error.request))
}

export default loader
