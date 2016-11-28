'use strict'

const jsonfile = require('jsonfile')
const path = require('path')
const version = require('../package.json').version

// Some default values for app/package.json
let jsonObj = {
  'name': 'SoundwaveInteractive',
  'productName': 'Soundwave Interactive',
  'version': version,
  'description': 'Soundwave Interactive Soundboard',
  'author': 'Derek Jensen <derek@deek.io>',
  'private': false,
  'license': 'MIT',
  'homepage': 'github.com/DeekyJay',
  'main': './main.js',
  'dependencies': {}
}

const devPackage = path.resolve(process.cwd(), 'package.json')
const appPackage = path.resolve(process.cwd(), 'app/package.json')

jsonfile.readFile(devPackage, (err, obj) => {
  if (err) {
    throw new Error(err)
  } else {
    jsonObj.dependencies = obj.dependencies
    jsonfile.writeFile(appPackage, jsonObj, (err) => {
      if (err) {
        throw new Error(err)
      }
    })
  }
})
