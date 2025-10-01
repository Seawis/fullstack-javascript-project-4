import { jest } from '@jest/globals'
import nock from 'nock'
import fsp from 'fs/promises'
import path from 'path'
import { tmpdir } from 'os'
import debug from 'debug'

import loader from '../src/loader.js'

const log = debug('page-loader-test')

let dir
beforeEach(async () => {
  // nock.disableNetConnect()
  dir = await fsp.mkdtemp(path.join(tmpdir(), 'page-loader-'))
  log(`Creating tempDir "${dir}" for "${expect.getState().currentTestName}"`)
})
afterEach(async () => await fsp.rmdir(dir, { recursive: true })
  .catch(console.err))

test('no site 404', async () => {
  nock('http://www.example404.com')
    .get('/')
    .reply(404, '123ABC')

  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
  await loader('http://www.example404.com', dir)

  await expect(mockExit).toHaveBeenCalledWith(2)
  mockExit.mockRestore()
})

test('rejects', async () => {
  nock('http://www.example.com')
    .get('/')

  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
  await loader('http://www.example.com', dir)

  await expect(mockExit).toHaveBeenCalledWith(3)
  mockExit.mockRestore()
})

test('errorSite 500', async () => {
  nock('http://www.example500.com')
    .get('/')
    .reply(500, '123ABC')

  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
  await loader('http://www.example500.com', dir)
  await expect(mockExit).toHaveBeenCalledWith(2)
  mockExit.mockRestore()
})

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

test('Permission denied 13', async () => {
  const scope = nock('http://www.exerr13.ru')
    .get('/')
    .reply(200)

  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
  await loader('http://www.exerr13.ru', '/sys')

  await expect(mockExit).toHaveBeenCalled()
  await expect(mockExit).toHaveBeenCalledWith(13)

  mockExit.mockRestore()
  scope.done()
})

test('No file Error1', async () => {
  const scope = nock('http://www.exerr1.ru')
    .get('/')
    .reply(200)

  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})

  await fsp.rmdir(dir)

  await loader('http://www.exerr1.ru', dir)
  await expect(mockExit).toHaveBeenCalled()
  await expect(mockExit).toHaveBeenCalledWith(1)

  await fsp.mkdir(dir)
  mockExit.mockRestore()
  scope.done()
})
