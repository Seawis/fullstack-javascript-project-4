import Listr from 'listr'
import fs from 'fs'
// import fsp from 'fs/promises'
import debug from 'debug'
import axios from 'axios'
import { axiosErrors } from './handlingErrors.js'
// import { axiosErrors, savingErrors } from './handlingErrors.js'

const log = debug('page-loader-listr')

const findDup = (massOfUrl) => {
  const seen = new Set()
  return massOfUrl.filter((item) => {
    const key = item.filepath
    if (!seen.has(key)) {
      seen.add(key)
      return true
    }
  })
}

export default async (entries) => {
  // entries: Array<{ url, filepath, title }>
  const massOfUrl = findDup(entries)

  const tasks = massOfUrl.map(e => ({
    title: e.title,
    task: async () => {
      return axios.get(e.url, { responseType: 'stream' })
      //        .then(response => fsp.writeFile(e.filePath, response.data)).catch(savingErrors)

        .then(response => new Promise((resolve, reject) => {
          const writer = fs.createWriteStream(e.filepath)
          response.data.pipe(writer)
          writer.on('finish', resolve)
          writer.on('error', reject)
        }),
        )
        .then(() => {
          log('Created file: ' + e.filepath)
          // return { ok: true }
        })
        .catch(err => axiosErrors(err, e.title))
    },
  }))

  const tasksRunner = new Listr(tasks, { concurrent: true })
  await tasksRunner.run()
/*
  try {
    await tasksRunner.run()
    return { ok: true }
  }
  catch (err) {
    return { ok: false, error: err }
  }
    */
}
