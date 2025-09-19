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
  const page = '<html><head></head><body>123ABC</body></html>'

  const scope = nock('http://www.example.com')
    .get('/')
    .reply(200, page)

  const files = await loader('http://www.example.com', dir)
    .then (() => fsp.readdir(dir))

  const fetchData = await fsp.readFile(`${dir}/${name}.html`, 'utf8')
    .catch((err) => {
      throw new Error(err)
    })

  expect(files).toEqual([`${name}.html`, `${name}_files`])
  expect(fetchData).toBe(page)
  // await expect(loader('http://www.example.com', '/pathToFakeDir')).resolves.toBe('/pathToFakeDir/www-example-com.html')
  scope.done()
})

test('loader with img', async () => {
  const name = 'ru-hexlet-io-courses'
  const html = await fsp.readFile(getFixturePath(`imgOnly/Before/${name}.html`), 'utf-8')
  const imagePath = getFixturePath(`imgOnly/Before/nodejs.png`)

  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, html)

  nock('https://ru.hexlet.io')
    .get('/assets/professions/nodejs.png')
    .reply(200, await fsp.readFile(imagePath), { 'Content-Type': 'image/png' })

  const files = await loader(`https://ru.hexlet.io/courses`, dir)
    .then (() => fsp.readdir(dir))

  const expected = await formatedHtmlPromise(getFixturePath(`imgOnly/After/${name}.html`))
  const fetchData = await formatedHtmlPromise(`${dir}/${name}.html`)

  expect(files).toEqual([`${name}.html`, `${name}_files`])
  expect(fetchData).toBe(expected)
})

test('loader with resources', async () => {
  const name = 'ru-hexlet-io-courses'
  const html = await fsp.readFile(getFixturePath(`withResources/Before/${name}.html`), 'utf-8')
  const imagePath = getFixturePath(`withResources/Before/nodejs.png`)
  const res = {
    link1: 'link1',
    link2: 'link2',
    link3: 'link3',
    script1: 'script1',
    script2: 'script2',
  }

  nock('https://ru.hexlet.io') // body
    .get('/courses')
    .reply(200, html)

  nock('https://ru.hexlet.io') // image
    .get('/assets/professions/nodejs.png')
    .reply(200, await fsp.readFile(imagePath), { 'Content-Type': 'image/png' })

  nock('https://cdn2.hexlet.io') // link1
    .get('/assets/menu.css')
    .reply(200, res.link1)

  nock('https://ru.hexlet.io') // link2
    .get('/assets/application.css')
    .reply(200, res.link2)

  nock('https://ru.hexlet.io') // link3
    .get('/courses')
    .reply(200, res.link3)

  nock('https://js.stripe.com') // script1
    .get('/v3/')
    .reply(200, res.script1)

  nock('https://ru.hexlet.io') // script2
    .get('/packs/js/runtime.js')
    .reply(200, res.script2)

  const files = await loader(`https://ru.hexlet.io/courses`, dir)
    .then (() => fsp.readdir(dir))

  const expectedData = await formatedHtmlPromise(getFixturePath(`withResources/After/${name}.html`))
  const fetchData = await formatedHtmlPromise(`${dir}/${name}.html`)

  const expectedRes = [
    'assets-application.css',
    'assets-professions-nodejs.png',
    'courses.html',
    'packs-js-runtime.js',
  ]
  const filesRes = await fsp.readdir(`${dir}/${name}_files`)
    .then (mass => mass.sort())

  const link2 = await fsp.readFile(`${dir}/${name}_files/assets-application.css`, 'utf-8')
  const script2 = await fsp.readFile(`${dir}/${name}_files/packs-js-runtime.js`, 'utf-8')

  expect(files).toEqual([`${name}.html`, `${name}_files`])
  expect(filesRes).toEqual(expectedRes)
  expect(link2).toBe(res.link2)
  expect(script2).toBe(res.script2)
  expect(fetchData).toBe(expectedData)
})
