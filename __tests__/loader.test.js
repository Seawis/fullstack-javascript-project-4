import nock from 'nock'
import mock from 'mock-fs'
import fsp from 'fs/promises'

import loader from '../src/loader.js'

beforeEach(() => {
  nock.disableNetConnect()
  mock ({
    pathToFakeDir: {},
  })
})

afterEach(() => {
  mock.restore()
})

test('loader resolve', async () => {
  const scope = nock('http://www.example.com')
    .get('/')
    .reply(200, '123ABC')

  const fetchData = await loader('http://www.example.com', 'pathToFakeDir').then(fP => fsp.readFile(fP, 'utf8'))
  expect(fetchData).toBe('123ABC')
  // await expect(loader('http://www.example.com', 'tmp')).resolves.toBe('tmp/www-example-com.html')
  scope.done()
})

test('loader rejects', async () => {
  nock('http://www.example.com')
    .get('/')
    .reply(404, '123ABC')

  await expect(loader('http://www.example.com', 'pathToFakeDir')).rejects.toThrow('404')
})

test('loader rejects', async () => {
  nock('http://www.example.com')
    .get('/')

  await expect(loader('http://www.example.com', 'pathToFakeDir')).rejects.toThrow()
})
