'use babel'
/* globals atom */

import fs from 'fs'
import path from 'path'
import EventEmitter from 'events'
const { workspace } = require('atom')
export let config = {
  loaded: false
}

export const eventEmitter = new EventEmitter()

export const projectPath = atom.project.getPaths()[0]
export const bannerFilename = '.bannerfile.json'
const packageFile = `${projectPath}/package.json`
const bannerFile = `${projectPath}/${bannerFilename}`

const loadJSON = filename => JSON.parse(fs.readFileSync(filename, {encoding: 'UTF-8'}))

const loadPackageBanner = (filepath = packageFile) => {
  if (!fs.existsSync(filepath)) return

  let pkg = loadJSON(filepath)
  if (pkg) {
    Object.assign(config, pkg.projectBanner || {}, { loaded: true, 'packageJson': pkg })
  }
}
const loadBannerFile = (filepath = bannerFile) => {
  if (!fs.existsSync(filepath)) return

  let bnr = loadJSON(filepath)
  if (bnr) {
    Object.assign(config, bnr, { loaded: true })
  }
}

const loadLocalBanner = filepath => {
  if (!fs.existsSync(filepath)) return
  const dirpath = path.dirname(filepath)

  let bnr = loadJSON(filepath)
  if (bnr) {
    Object.assign(config, { paths: { ...config.paths || {}, [dirpath]: bnr}}, { loaded: true })
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

const getBannerSettingsPath = dirname => {
  const filename = config.bannerFilename || bannerFilename
  const filepath = path.join(dirname, filename)
  // check .bannerfile.json
  if (fs.existsSync(filepath)) {
    fs.watch(dirname, {encoding: 'UTF-8'}, (eventType) => {
      loadBannerFile(filepath)
      eventEmitter.emit('config-update')
    })
  }

  loadPackageBanner()
  loadBannerFile()

  return config
}
// const disposable = workspace.onDidStopChangingActivePaneItem(item => {
//   const { buffer: { file } } = item
//   const dirname = path.dirname(file.path)
// })
//

export const getBanner = dirname => {
  const filename = config.bannerFilename || bannerFilename
  const filepath = path.join(dirname, filename)
  // check .bannerfile.json
  if (fs.existsSync(filepath)) {
    fs.watch(dirname, {encoding: 'UTF-8'}, (eventType) => {
      loadBannerFile(filepath)
      eventEmitter.emit('config-update')
    })
  }

  loadPackageBanner()
  loadBannerFile()

  return config
}

 // Immediately stop receiving filesystem events. If this is the last
 // watcher, asynchronously release any OS resources required to
 // subscribe to these events.
 // disposable.dispose()

export default getBannerSettings()
