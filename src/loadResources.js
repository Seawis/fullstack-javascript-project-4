import debug from 'debug'
import * as cheerio from 'cheerio'

import { pathToDashed } from './loadPaths.js'

const log = debug('page-loader-res')

export default (html, p) => {
  const $ = cheerio.load(html)
  const linked = {
    img: 'src',
    link: 'href',
    script: 'src',
  }

  const filePaths = Object.keys(linked).reduce((acc, res) => {
    log(`loading "${res}"`)

    $(res).each((i, elem) => {
      const oldSrc = $(elem).attr(linked[res])
      const url = new URL(oldSrc, p.url)
      const fileName = pathToDashed(oldSrc, p.url.hostname)

      if (oldSrc && (p.url.hostname === url.hostname) && fileName !== null) {
        const newSrc = `${p.dirName}/${fileName}`

        log(`change "${oldSrc}" to "${newSrc}"`)
        $(elem).attr(linked[res], newSrc)

        const massOfUrl = {
          url: url,
          filePath: `${p.dirPath}/${fileName}`,
          title: oldSrc,
        }

        acc.push(massOfUrl)
      }
    })

    return acc
  }, [])

  return [$.html(), filePaths]
}
