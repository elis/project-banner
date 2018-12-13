'use babel'
/* globals atom */
import { Emitter, CompositeDisposable } from 'atom'

import fs from 'fs'
import EventEmitter from 'events'
const CSON = require('season')
export let config = {
  loaded: false
}

export const bannerfile = '.bannerfile'
export const projectPath = atom.project.getPaths()[0]
export const packageFile = `${projectPath}/package.json`

const requireSmart = async filename => {
  let allowExecution = atom.config.get('project-banner.allowExecution')
  if (allowExecution && allowExecution.indexOf(projectPath) !== -1) {
    const data = await new Promise((resolve, reject) => fs.readFile(filename, {encoding: 'utf8'}, (err, result) => !err ? resolve(result) : reject(err)))
    return eval(data)
  }

  return false
}

const requireJson = filename => new Promise((resolve, reject) =>
  CSON.readFile(filename, (err, data) =>
    err ? reject(err) : resolve(data)
  )
)

const parsers = {
  'js': requireSmart,
  'coffee': requireSmart,
  'json': requireJson,
  'cson': requireJson
}

export const discoverConfig = async (relative, pathname = projectPath) => {
  const exts = Object.keys(parsers)
  return exts
    .map(ext => `${pathname}/${(relative && `${relative}/`) || ''}${bannerfile}.${ext}`)
    .filter(fullpath => fs.existsSync(fullpath))
  // return {}
}

export const watchConfig = (filename, callback) => {
  const watcher = fs.watch(filename, { encoding: 'utf8' }, async (eventType, fname) => {
    const data = await readConfig(filename)
    callback(data)
  })

  readConfig(filename).then(callback)

  return {
    dispose: () => {
      watcher.close()
    }
  }
}

export const readConfig = async (filename) => {
  const ext = filename.split('.').pop()
  const parser = parsers[ext]

  return parser(filename)
}
