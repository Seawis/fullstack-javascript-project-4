import nock from 'nock'
import fsp from 'fs/promises'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import { tmpdir } from 'os'
import debug from 'debug'
import { jest } from '@jest/globals'

import writeFiles from '../src/writeFiles.js'

const log = debug('page-loader-test')

const __dirname = dirname(fileURLToPath(import.meta.url))
const getFixturePath = filename =>
  path.join(__dirname, '..', '__fixtures__', filename)

let dir
beforeEach(async () => {
  // nock.disableNetConnect()
  dir = await fsp.mkdtemp(path.join(tmpdir(), 'page-loader-'))
  log(`Creating tempDir "${dir}" for "${expect.getState().currentTestName}"`)
})
afterEach(async () => await fsp.rmdir(dir, { recursive: true }))

test('with resources', async () => {
  const name = 'ru-hexlet-io-courses'
  const nameOfSite = 'https://ru.hexlet.io'
  const imagePath = getFixturePath(`withResources/Before/nodejs.png`)
  // const html = await fsp.readFile(getFixturePath(`withResources/Before/${name}.html`), 'utf-8')
  // nock(nameOfSite).get('/courses').reply(200, html)
  const res = {
    link1: 'link1',
    link2: 'link2',
    link3: 'link3',
    script1: 'script1',
    script2: 'script2',
  }

  nock(nameOfSite) // image
    .get('/assets/professions/nodejs.png')
    .reply(200, await fsp.readFile(imagePath), { 'Content-Type': 'image/png' })

  nock('https://cdn2.hexlet.io') // link1
    .get('/assets/menu.css')
    .reply(200, res.link1)

  nock(nameOfSite) // link2
    .get('/assets/application.css')
    .reply(200, res.link2)

  nock(nameOfSite) // link3
    .get('/courses')
    .reply(200, res.link3)

  nock('https://js.stripe.com') // script1
    .get('/v3/')
    .reply(200, res.script1)

  nock(nameOfSite) // script2
    .get('/packs/js/runtime.js')
    .reply(200, res.script2)

  const massOfUrls = [
    {
      url: new URL(`${nameOfSite}/assets/professions/nodejs.png`),
      filepath: `${dir}/${name}_files/assets-professions-nodejs.png`,
      title: '/assets/professions/nodejs.png',
    },
    {
      url: new URL(`${nameOfSite}/assets/application.css`),
      filepath: `${dir}/${name}_files/assets-application.css`,
      title: '/assets/application.css',
    },
    {
      url: new URL(`${nameOfSite}/courses`),
      filepath: `${dir}/${name}_files/courses.html`,
      title: '/courses',
    },
    {
      url: new URL(`${nameOfSite}/packs/js/runtime.js`),
      filepath: `${dir}/${name}_files/packs-js-runtime.js`,
      title: `${nameOfSite}/packs/js/runtime.js`,
    },
  ]

  await fsp.mkdir(`${dir}/${name}_files`)
  await writeFiles(massOfUrls)

  const filesRes = await fsp.readdir(`${dir}/${name}_files`)
    .then(mass => mass.sort())
  log(`Reading ${dir}/${name}_files`)
  const expectedRes = [
    'assets-application.css',
    'assets-professions-nodejs.png',
    'courses.html',
    'packs-js-runtime.js',
  ]
  expect(filesRes).toEqual(expectedRes)

  const link2 = await fsp.readFile(`${dir}/${name}_files/assets-application.css`, 'utf-8')
  const script2 = await fsp.readFile(`${dir}/${name}_files/packs-js-runtime.js`, 'utf-8')
  expect(link2).toBe(res.link2)
  expect(script2).toBe(res.script2)
})

test('with AxiosErrors', async () => {
  const name = 'ru-hexlet-io-courses'
  const nameOfSite = 'https://ru.hexlet.io'
  const imagePath = getFixturePath(`withResources/Before/nodejs.png`)
  const res = {
    link2: 'link2',
    link3: 'link3',
    script2: 'script2',
  }

  nock(nameOfSite) // image
    .get('/assets/professions/nodejs.png')
    .reply(200, await fsp.readFile(imagePath), { 'Content-Type': 'image/png' })

  nock(nameOfSite) // link2
    .get('/assets/application.css')
    .reply(404, res.link2)

  nock(nameOfSite) // link3
    .get('/courses')
    .reply(200, res.link3)

  nock(nameOfSite) // script2
    .get('/packs/js/runtime.js')
    .reply(200, res.script2)

  const massOfUrls = [
    {
      url: new URL(`${nameOfSite}/assets/professions/nodejs.png`),
      filepath: `${dir}/${name}_files/assets-professions-nodejs.png`,
      title: '/assets/professions/nodejs.png',
    },
    {
      url: new URL(`${nameOfSite}/assets/application.css`),
      filepath: `${dir}/${name}_files/assets-application.css`,
      title: '/assets/application.css',
    },
    {
      url: new URL(`${nameOfSite}/courses`),
      filepath: `${dir}/${name}_files/courses.html`,
      title: '/courses',
    },
    {
      url: new URL(`${nameOfSite}/packs/js/runtime.js`),
      filepath: `${dir}/${name}_files/packs-js-runtime.js`,
      title: `${nameOfSite}/packs/js/runtime.js`,
    },
  ]

  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})

  await fsp.mkdir(`${dir}/${name}_files`)
  await writeFiles(massOfUrls)

  const filesRes = await fsp.readdir(`${dir}/${name}_files`)
    .then(mass => mass.sort())
  log(`Reading ${dir}/${name}_files`)
  const expectedRes = [
    // 'assets-application.css',
    'assets-professions-nodejs.png',
    'courses.html',
    'packs-js-runtime.js',
  ]
  expect(filesRes).toEqual(expectedRes)

  const script2 = await fsp.readFile(`${dir}/${name}_files/packs-js-runtime.js`, 'utf-8')
  expect(script2).toBe(res.script2)

  expect(mockExit).toHaveBeenCalled()
  mockExit.mockRestore()
})

test('with SavingErrors & findDup', async () => {
  nock('https://ru.hexlet.io')
    .get('/assets/application.css')
    .reply(200, 'link2')

  const massOfUrls = [
    {
      url: new URL(`https://ru.hexlet.io/assets/application.css`),
      filepath: `${dir}/ru-hexlet-io-courses_files/assets-application.css`,
      title: '/assets/application.css',
    },
    {
      url: new URL(`https://ru.hexlet.io/assets/app.css`),
      filepath: `${dir}/ru-hexlet-io-courses_files/assets-application.css`,
      title: '/assets/app.css',
    },
  ]

  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
  // await fsp.mkdir(`${dir}/${name}_files`)
  await writeFiles(massOfUrls)

  expect(mockExit).toHaveBeenCalled()
  expect(mockExit).toHaveBeenCalledWith(4)
  // await (expect(writeFiles(massOfUrls)).reject.toThrow)
  mockExit.mockRestore()
})
