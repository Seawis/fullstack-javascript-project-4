import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

import { pathForUrl, defaultDir } from '../src/filePaths.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const getFixturePath = filename =>
  path.join(__dirname, '..', filename)

test('defaultDir', () => {
  expect(defaultDir('tmp')).toBe(getFixturePath('tmp'))
  expect(defaultDir('./tmp/newFolder')).toBe(getFixturePath('tmp/newFolder'))
  expect(defaultDir('/tmp')).toBe('/tmp')
})

test('pathForUrl', () => {
  expect(pathForUrl('https://ru.hexlet.io/courses/', '/tmp')).toBe('/tmp/ru-hexlet-io-courses.html')
  expect(pathForUrl('http://ru.hexlet.io/courses', './tmp')).toBe('tmp/ru-hexlet-io-courses.html')
})
