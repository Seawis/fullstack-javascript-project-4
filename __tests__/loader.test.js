import nock from 'nock'
import fsp from 'fs/promises'
import prettier from 'prettier'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import { tmpdir } from 'os'

import loader from '../src/loader.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const getFixturePath = filename =>
  path.join(__dirname, '..', '__fixtures__', filename)

const formatedHtmlPromise = path => fsp.readFile(path, 'utf8')
  .then(html => prettier.format(html, { parser: 'html' }))
  .catch((err) => {
    throw new Error(err)
  })

let dir
beforeEach(async () => {
  nock.disableNetConnect()
  dir = await fsp.mkdtemp(path.join(tmpdir(), 'page-loader-'))
})
afterEach(async () => await fsp.rmdir(dir, { recursive: true }))

test('loader rejects 404', async () => {
  nock('http://www.example.com')
    .get('/')
    .reply(404, '123ABC')

  await expect(loader('http://www.example.com', dir)).rejects.toThrow('404')
})

test('loader rejects', async () => {
  nock('http://www.example.com')
    .get('/')

  await expect(loader('http://www.example.com', dir)).rejects.toThrow()
})

test('loader without img', async () => {
  const name = 'www-example-com'
  const scope = nock('http://www.example.com')
    .get('/')
    .reply(200, '<html><head></head><body>123ABC</body></html>')

  const files = await loader('http://www.example.com', dir)
    .then (() => fsp.readdir(dir))

  const fetchData = await fsp.readFile(`${dir}/www-example-com.html`, 'utf8')
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
  const html = await fsp.readFile(getFixturePath(`Before/${name}.html`), 'utf-8')
  const imagePath = getFixturePath(`Before/nodejs.png`)

  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, html)

  nock('https://ru.hexlet.io')
    .get('/assets/professions/nodejs.png')
    .reply(200, await fsp.readFile(imagePath), { 'Content-Type': 'image/png' })

  const files = await loader(`https://ru.hexlet.io/courses`, dir)
    .then (() => fsp.readdir(dir))

  const expected = await formatedHtmlPromise(getFixturePath(`After/${name}.html`))
  const fetchData = await formatedHtmlPromise(`${dir}/${name}.html`)

  expect(files).toEqual([`${name}.html`, `${name}_files`])
  expect(fetchData).toBe(expected)
})
