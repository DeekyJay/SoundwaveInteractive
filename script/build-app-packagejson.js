'use strict'

const jsonfile = require('jsonfile')
const path = require('path')

// Some default values for app/package.json
let jsonObj = {
  'name': 'SoundwaveInteractive',
  'productName': 'Soundwave Interactive',
  'version': '1.0.0',
  'description': 'Soundwave Interactive Soundboard',
  'author': 'Derek Jensen',
  'private': false,
  'license': 'MIT',
  'homepage': 'github.com/Leviathan5',
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
