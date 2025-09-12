// import loader from './loader.js'
// import { pathForUrl } from '../src/loadPaths.js'

import fsp from 'fs/promises'
// import * as cheerio from 'cheerio'
import axios from 'axios'

const loadResources = () => {
  const src = 'https://ru.hexlet.io/vite/assets/logo_ru_light-BpiEA1LT.svg'

  axios.get(src, { responseType: 'stream' })
    .then(response => fsp.writeFile('/tmp/hhh/BpiEA1LT.svg', response.data))
/*
  axios({
    method: 'get',
    url: 'https://bit.ly/2mTM3nY',
    responseType: 'arraybuffer',
  })
    .then(response => Buffer.from(response.data, 'binary'))
    .then(fileData => fsp.writeFile('/tmp/hhh/ada_lovelace.jpg', fileData))
*/
}

export default loadResources
