#!/usr/bin/env node
import { program } from 'commander'
import pageLoader from '../src/pageLoader.js'

program
  .name('page-loader')
  .description('Page loader utility')
  .version('1.0.0')

  .argument('url', 'url for load')
  .option('-o, --output [dir]', 'output dir', '/tmp')
  .action((url) => {
    const result = pageLoader(url, program.opts().output)
    // console.log(result)
  })
  .parse()
