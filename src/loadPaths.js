import path from 'path'
import process from 'process'

const fName = href => href
  .replace(/^[a-zA-Z]+:\/\//, '') // убираем http:// или https://
  .replace(/[^a-zA-Z0-9]+/g, '-') // меняем все символы на -
  .replace(/^-+/, '') // Убираем возможные начальные дефисы
  .replace(/-$/, '') // Убираем возможные конечные дефисы

const defaultDir = dirPath => path.resolve(process.cwd(), dirPath) // path.relative(process.cwd(), dirPath)

const pathForUrl = (url, outputDir) => {
  const fileName = fName(url)
  const dirName = `${fileName}_files`

  const p = {
    filePath: path.join(outputDir, `${fileName}.html`),
    dirName: dirName,
    dirPath: path.join(outputDir, `${dirName}`),
    fullDirPath: path.resolve(outputDir, `${dirName}`),
    // nameOfSite: url.match(/https?:\/\/([^/]+)/)[1].replace(/\./g, '-'),
    url: new URL(url),
  }
  return p
}

const pathToDashed = (inputPath, hostname) => {
  if (typeof inputPath !== 'string') return null
  // Разделяем на имя файла и расширение
  const lastDot = inputPath.lastIndexOf('.')
  const name = lastDot !== -1 ? inputPath.slice(0, lastDot) : inputPath // имя файла
  const ext = lastDot !== -1 ? inputPath.slice(lastDot) : '.html' // расширение

  if (ext.indexOf('/') !== -1) return null
  const str = fName(name) + ext
  const prefix = hostname.replace(/[^a-zA-Z0-9]+/g, '-') // имя сайта
  // добавляем или удаляем имя сайта в имени
  return str.startsWith(prefix) ? str.slice(prefix.length).replace(/^-+/, '').replace(/-$/, '') : str
}

export { pathForUrl, defaultDir, pathToDashed }
