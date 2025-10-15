import loader from './src/loader.js'
// import { defaultDir } from './src/loadPaths.js'

export default (url, output = process.cwd()) => loader(url, output) // defaultDir('tmp')
