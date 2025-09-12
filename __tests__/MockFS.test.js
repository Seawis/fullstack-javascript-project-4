import nock from 'nock'
import mock from 'mock-fs'
import fsp from 'fs/promises'

import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

import loader from '../src/loader.js'

import axios from 'axios'

const __dirname = dirname(fileURLToPath(import.meta.url))
const getFixturePath = filename =>
  path.join(__dirname, '..', '__fixtures__', filename)

beforeEach(() => {
  nock.disableNetConnect()
  mock ({
    '/pathToFakeDir': { },
  })
})

afterEach(() => {
  mock.restore()
})

test('loader rejects 404', async () => {
  nock('http://www.example.com')
    .get('/')
    .reply(404, '123ABC')

  await expect(loader('http://www.example.com', '/pathToFakeDir')).rejects.toThrow('404')
})

test('loader rejects', async () => {
  nock('http://www.example.com')
    .get('/')

  await expect(loader('http://www.example.com', '/pathToFakeDir')).rejects.toThrow()
})

test('loader without img', async () => {
  const scope = nock('http://www.example.com')
    .get('/')
    .reply(200, '<html><head></head><body>123ABC</body></html>')

  const files = await loader('http://www.example.com', '/pathToFakeDir')
    .then (() => fsp.readdir('/pathToFakeDir'))

  const fetchData = await fsp.readFile('/pathToFakeDir/www-example-com.html', 'utf8')
    .catch((err) => {
      throw new Error(err)
    })

  expect(files).toEqual(['www-example-com.html', 'www-example-com_files'])
  expect(fetchData).toBe('<html><head></head><body>123ABC</body></html>')
  // await expect(loader('http://www.example.com', '/pathToFakeDir')).resolves.toBe('/pathToFakeDir/www-example-com.html')
  scope.done()
})
/*
test('loader with img', async () => {
  const realHtmlPath = getFixturePath('Before/ru-hexlet-io-courses.html')
  const html = await mock.bypass(async () => await fsp.readFile(realHtmlPath, 'utf-8'))
  console.log(html)

  const scope = nock('https://ru.hexlet.io/courses')
    .get('/')
    .reply(200, '<html><head></head><body>123ABC</body></html>')

  const files = await loader('https://ru.hexlet.io/courses', '/pathToFakeDir')
    .then (() => fsp.readdir('/pathToFakeDir'))
    .then(console.log)

  // const fetchData = await fsp.readFile('/pathToFakeDir/www-example-com.html', 'utf8')

  expect(files).toEqual(['www-example-com.html', 'www-example-com_files'])
  // expect(fetchData).toBe('<html><head></head><body>123ABC</body></html>')
  // await expect(loader('http://www.example.com', '/pathToFakeDir')).resolves.toBe('/pathToFakeDir/www-example-com.html')
  // scope.done()
})
*/
test('with img', async () => {
  const realHtmlPath = getFixturePath('Before/ru-hexlet-io-courses.html')
  const html = await mock.bypass(async () => await fsp.readFile(realHtmlPath, 'utf-8'))

  const realImagePath = getFixturePath('Before/nodejs.png')
  const image = await mock.bypass(async () => await fsp.readFile(realImagePath, 'utf-8'))

  const urlAddr = 'https://www.ex.co'

  const scope = nock(urlAddr)
    .get('/')
    .reply(200, html)

  nock(`${urlAddr}/nodejs.png`)
    .get('/')
    // .reply(200, image)
    /*
    .reply(200, (uri, requestBody) => {
      return fs.createReadStream('cat-poems.txt')
    })
    */
    .replyWithFile(200, image, { 'Content-Type': 'image/png' })

  const files = await loader(urlAddr, '/pathToFakeDir')
    .then (() => fsp.readdir('/pathToFakeDir'))

  // const fetchData = await fsp.readFile('/pathToFakeDir/www-ex-co.html', 'utf8')

  expect(files).toEqual(['www-ex-co.html', 'www-ex-co_files'])
  // expect(fetchData).toBe('<html><head></head><body>123ABC</body></html>')
  // await expect(loader('http://www.example.com', '/pathToFakeDir')).resolves.toBe('/pathToFakeDir/www-example-com.html')
  scope.done()
})
