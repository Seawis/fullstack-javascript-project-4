#!/usr/bin/env node
import { program } from 'commander'
import loader from '../src/loader.js'
import { defaultDir } from '../src/filePaths.js'

program
  .name('page-loader')
  .description('Page loader utility')
  .version('1.0.0')

  .argument('url', 'URL for saving')
  .option('-o, --output [dir]', 'output dir', defaultDir('tmp'))
  .action((url) => {
    loader(url, program.opts().output)
  })
  .parse()
