import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

import { pathForUrl, defaultDir, pathToDashed } from '../src/loadPaths.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const getFixturePath = filename =>
  path.join(__dirname, '..', filename)

test('defaultDir', () => {
  expect(defaultDir('tmp')).toBe(getFixturePath('tmp'))
  expect(defaultDir('./tmp/newFolder')).toBe(getFixturePath('tmp/newFolder'))
  expect(defaultDir('/tmp')).toBe('/tmp')
  expect(defaultDir('')).toBe(getFixturePath(''))
})

const expected = {
  dirName: 'ru-hexlet-io-courses_files',
  dirPath: '/tmp/ru-hexlet-io-courses_files',
  filePath: '/tmp/ru-hexlet-io-courses.html',
  fullDirPath: '/tmp/ru-hexlet-io-courses_files',
  url: new URL('https://ru.hexlet.io/courses/'),
}

const expectedFullPath = {
  dirName: 'ru-hexlet-io-courses_files',
  dirPath: 'tmp/ru-hexlet-io-courses_files',
  filePath: 'tmp/ru-hexlet-io-courses.html',
  fullDirPath: path.join(__dirname, '..', '/tmp/ru-hexlet-io-courses_files'),
  url: new URL('http://ru.hexlet.io/courses'),
}

test('pathForUrl', () => {
  expect(pathForUrl('https://ru.hexlet.io/courses/', '/tmp')).toEqual(expected)
  expect(pathForUrl('http://ru.hexlet.io/courses', './tmp')).toEqual(expectedFullPath)
})

test('pathToDashed', () => {
  const hostname = 'ru.hexlet.io'
  expect(pathToDashed('http://ru.hexlet.io/courses/image.jpg', hostname)).toBe('courses-image.jpg')
  expect(pathToDashed('folder/newFile.ext', hostname)).toBe('folder-newFile.ext')
  expect(pathToDashed('https://ru.hexlet.io/vite/assets/logo_ru_light-BpiEA1LT.svg', hostname))
    .toBe('vite-assets-logo-ru-light-BpiEA1LT.svg')
  expect(pathToDashed('/assets/professions-pro/nodejs.png', hostname)).toBe('assets-professions-pro-nodejs.png')
  expect(pathToDashed('https://ru.hexlet.io/courses', hostname)).toBe(null)
  expect(pathToDashed(1, hostname)).toBe(null)
})
