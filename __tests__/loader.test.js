import { jest } from '@jest/globals'
import nock from 'nock'
import fsp from 'fs/promises'
import prettier from 'prettier'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import { tmpdir } from 'os'
import debug from 'debug'

import loader from '../src/loader.js'

const log = debug('page-loader-test')

const __dirname = dirname(fileURLToPath(import.meta.url))
const getFixturePath = filename =>
  path.join(__dirname, '..', '__fixtures__', filename)

// Используем prettier для нормализации html-файла
const formatedHtmlPromise = path => fsp.readFile(path, 'utf8')
  .then(html => prettier.format(html, { parser: 'html' }))
  .catch((err) => {
    throw new Error(err)
  })

let dir
beforeEach(async () => {
  nock.disableNetConnect()
  dir = await fsp.mkdtemp(path.join(tmpdir(), 'page-loader-'))
  log(`Creating tempDir "${dir}" for "${expect.getState().currentTestName}"`)
})
afterEach(async () => await fsp.rmdir(dir, { recursive: true }))

test('without img', async () => {
  const name = 'www-example-com'
  const page = '<html><head></head><body>123ABC</body></html>'

  const scope = nock('http://www.example.com')
    .get('/')
    .reply(200, page)

  await loader('http://www.example.com', dir)
  const files = await fsp.readdir(dir)
  log(`Reading ${dir}`)

  const fetchData = await fsp.readFile(`${dir}/${name}.html`, 'utf8')
    .catch((err) => {
      throw new Error(err)
    })
  log(`Reading ${name}.html`)

  expect(files).toEqual([`${name}.html`, `${name}_files`])
  expect(fetchData).toBe(page)
  // await expect(loader('http://www.example.com', '/pathToFakeDir')).resolves.toBe('/pathToFakeDir/www-example-com.html')
  scope.done()
})

test('with img', async () => {
  const name = 'ru-hexlet-io-courses'
  const html = await fsp.readFile(getFixturePath(`imgOnly/Before/${name}.html`), 'utf-8')
  const imagePath = getFixturePath(`imgOnly/Before/nodejs.png`)

  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, html)

  nock('https://ru.hexlet.io')
    .get('/assets/professions/nodejs.png')
    .reply(200, await fsp.readFile(imagePath), { 'Content-Type': 'image/png' })

  await loader(`https://ru.hexlet.io/courses`, dir)
  const files = await fsp.readdir(dir)
  log(`Reading ${dir}`)

  const expected = await formatedHtmlPromise(getFixturePath(`imgOnly/After/${name}.html`))
  const fetchData = await formatedHtmlPromise(`${dir}/${name}.html`)

  expect(files).toEqual([`${name}.html`, `${name}_files`])
  expect(fetchData).toBe(expected)
})

test('no site 404', async () => {
  nock('http://www.example404.com')
    .get('/')
    .reply(404, '123ABC')

  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
    // throw new Error('Boom!')
  })
  await loader('http://www.example404.com', dir)
  // await expect(loader('http://www.example404.com', dir)).rejects.toThrow('Boom!')

  await expect(mockExit).toHaveBeenCalled() // await expect(mockExit).toHaveBeenCalledWith(2)
  mockExit.mockRestore()
})

test('rejects', async () => {
  nock('http://www.example.com')
    .get('/')

  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
  await loader('http://www.example.com', dir)

  await expect(mockExit).toHaveBeenCalled() // await expect(mockExit).toHaveBeenCalledWith(3)
  mockExit.mockRestore()
})

test('errorSite 500', async () => {
  nock('http://www.example500.com')
    .get('/')
    .reply(500, '123ABC')

  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
  await loader('http://www.example500.com', dir)

  await expect(mockExit).toHaveBeenCalled() // await expect(mockExit).toHaveBeenCalledWith(2)
  mockExit.mockRestore()
})
/*
test('Folder exists 17', async () => {
  const name = 'www-exerr17-ru'
  const page = '<html><head></head><body>123ABC</body></html>'

  const scope = nock('http://www.exerr17.ru')
    .get('/')
    .reply(200, page)

  const mockError = jest.spyOn(console, 'error')

  await fsp.mkdir(`${dir}/${name}_files`)
  await loader('http://www.exerr17.ru', dir)

  const files = await fsp.readdir(dir)
  log(`Reading ${dir}`)

  expect(files).toEqual([`${name}.html`, `${name}_files`])
  expect(mockError).toHaveBeenCalled()
  expect(mockError).toHaveBeenCalledWith(`Already exists: "${dir}/${name}_files"`)

  mockError.mockRestore()
  scope.done()
})
*/
test('Permission denied 13', async () => {
  const scope = nock('http://www.exerr13.ru')
    .get('/')
    .reply(200)

  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
  await loader('http://www.exerr13.ru', '/sys')

  await expect(mockExit).toHaveBeenCalled() // await expect(mockExit).toHaveBeenCalledWith(13)

  mockExit.mockRestore()
  scope.done()
})
/*
test('No file Error1', async () => {
  const scope = nock('http://www.exerr1.ru')
    .get('/')
    .reply(200)

  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})

  await fsp.rmdir(dir)

  await loader('http://www.exerr1.ru', dir)
  await expect(mockExit).toHaveBeenCalled() // await expect(mockExit).toHaveBeenCalledWith(1)

  await fsp.mkdir(dir)
  mockExit.mockRestore()
  scope.done()
})
*/
