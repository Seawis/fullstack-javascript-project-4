import path from 'path'
import process from 'process'

const fName = href => href
  .replace(/^[a-zA-Z]+:\/\//, '') // убираем http:// или https://
  .replace(/[^a-zA-Z0-9]+/g, '-') // меняем все символы на -
  .replace(/^-+|-+$/g, '') // Убираем возможные начальные/конечные дефисы

const defaultDir = dirPath => path.resolve(process.cwd(), dirPath) // path.relative(process.cwd(), dirPath)

const pathForUrl = (url, outputDir) => {
  const fileName = fName(url)
  const dirName = `${fileName}_files`

  const p = {
    filePath: path.join(outputDir, `${fileName}.html`),
    // fullFilePath: path.resolve(outputDir, `${fileName}.html`),
    dirName: dirName,
    dirPath: path.join(outputDir, `${dirName}`), // .replace(/^\//, ''),
    fullDirPath: path.resolve(outputDir, `${dirName}`),
    // nameOfSite: url.match(/https?:\/\/([^/]+)/)[1].replace(/\./g, '-'),
  }
  // console.log(p)
  return p
}

const pathToDashed = (inputPath) => {
  // Разделяем на имя файла и расширение
  const lastDot = inputPath.lastIndexOf('.')
  const name = lastDot !== -1 ? inputPath.slice(0, lastDot) : inputPath
  const ext = lastDot !== -1 ? inputPath.slice(lastDot) : ''

  return fName(name) + ext
}

export { pathForUrl, defaultDir, pathToDashed }
