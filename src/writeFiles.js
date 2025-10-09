// import Listr from 'listr'
import { Listr } from 'listr2'
import fsp from 'fs/promises'
import debug from 'debug'
import axios from 'axios'
import { axiosErrors, savingErrors } from './handlingErrors.js'

const log = debug('page-loader-listr')

const findDup = (massOfUrl) => {
  const seen = new Set()
  return massOfUrl.filter((item) => {
    const key = item.filePath
    if (!seen.has(key)) {
      seen.add(key)
      return true
    }
  })
}

export default (entries) => {
  // entries: Array<{ url, filePath, title }>
  const massOfUrl = findDup(entries)

  // Listr2
  const tasks = massOfUrl.map(e => ({
    title: e.title,
    task: () => axios.get(e.url, { responseType: 'stream' })
      .then(response => fsp.writeFile(e.filePath, response.data).catch(savingErrors))
      .then(() => log('Created file: ' + e.filePath))
      .catch(err => axiosErrors(err, e.title)),
  }))
  const tasksRunner = new Listr(tasks, { concurrent: true, exitOnError: false })
  const result = tasksRunner.run()
  result.then(() => console.log('Done!'))
  return result
}
