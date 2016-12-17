'use babel'
/* globals atom */

import fs from 'fs'
let config = {
  loaded: false
}
import EventEmitter from 'events'

export const eventEmitter = new EventEmitter()

export const projectPath = atom.project.getPaths()[0]
const packageFile = `${projectPath}/package.json`
const bannerFile = `${projectPath}/.bannerfile.json`

const loadJSON = filename => JSON.parse(fs.readFileSync(filename, {encoding: 'UTF-8'}))

const loadPackageBanner = () => {
  if (!fs.existsSync(packageFile)) return

  let pkg = loadJSON(packageFile)
  if (pkg && pkg.projectBanner) {
    Object.assign(config, pkg.projectBanner, { loaded: true })
  }
}
const loadBannerFile = () => {
  if (!fs.existsSync(bannerFile)) return

  let bnr = loadJSON(bannerFile)
  if (bnr) {
    Object.assign(config, bnr, { loaded: true })
  }
}

let getBannerSettings = () => {
  // check package.json
  if (fs.existsSync(packageFile)) {
    fs.watch(packageFile, {encoding: 'UTF-8'}, (eventType) => {
      loadPackageBanner()
      eventEmitter.emit('config-update')
    })
  }

  // check .bannerfile.json
  if (fs.existsSync(bannerFile)) {
    fs.watch(bannerFile, {encoding: 'UTF-8'}, (eventType) => {
      loadBannerFile()
      eventEmitter.emit('config-update')
    })
  }

  loadPackageBanner()
  loadBannerFile()

  return config
}

export default getBannerSettings()
