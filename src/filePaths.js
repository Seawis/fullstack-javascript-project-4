import path from 'path'
import process from 'process'

const defaultDir = dirPath => path.resolve(process.cwd(), dirPath)

const pathForUrl = (url, outputDir) => {
  const fileName = url
    .replace(/^[a-zA-Z]+:\/\//, '') // убираем http:// или https://
    .replace(/[^a-zA-Z0-9]+/g, '-') // меняем все символы на -
    .replace(/^-+|-+$/g, '') // Убираем возможные начальные/конечные дефисы
  return path.join(outputDir, `${fileName}.html`)
}

export { pathForUrl, defaultDir }
