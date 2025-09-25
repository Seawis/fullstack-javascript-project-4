import loader from './src/loader.js'
import { defaultDir } from './src/filePaths.js'

export default (url, output = defaultDir('tmp')) => loader(url, output)
