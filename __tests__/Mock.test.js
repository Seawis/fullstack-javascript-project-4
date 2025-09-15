import nock from 'nock'
import fsp from 'fs/promises'
import prettier from 'prettier'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import mock from 'mock-fs'

import loader from '../src/loader.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const getFixturePath = filename =>
  path.join(__dirname, '..', '__fixtures__', filename)

const formatedHtmlPromise = path => fsp.readFile(path, 'utf8')
  .then(html => prettier.format(html, { parser: 'html' }))
  .catch((err) => {
    throw new Error(err)
  })

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

test('loader with img', async () => {
  const name = 'ru-hexlet-io-courses'
  const dir = '/pathToFakeDir'

  const data = realFixturePath => mock.bypass(() => fsp.readFile(getFixturePath(realFixturePath), 'utf-8'))

  const html = await data('Before/ru-hexlet-io-courses.html')
  const image = await data('Before/nodejs.png')

  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, html)

  nock('https://ru.hexlet.io')
    .get('/assets/professions/nodejs.png')
    .reply(200, image, { 'Content-Type': 'image/png' })

  const files = await loader(`https://ru.hexlet.io/courses`, dir)
    .then (() => fsp.readdir(dir))

  const expected = await formatedHtmlPromise(getFixturePath(`After/${name}.html`))
  const fetchData = await formatedHtmlPromise(`${dir}/${name}.html`)

  expect(files).toEqual([`${name}.html`, `${name}_files`])
  expect(fetchData).toBe(expected)
})
