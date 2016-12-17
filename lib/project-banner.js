'use babel'
/* globals atom */

import ProjectBannerView from './project-banner-view'
import { CompositeDisposable } from 'atom'

import bconfig from './reads'
import { eventEmitter as bconfigEmitter } from './reads'

const projectBanner = {

  projectBannerView: null,
  modalPanel: null,
  subscriptions: null,
  config: {
    showProjectBanner: {
      type: 'boolean',
      default: false
    },
    panelPosition: {
      type: 'string',
      default: 'bottom',
      description: 'Where to position the Project Banner (Requires restart)',
      enum: [
        {value: 'bottom', description: 'The Project Banner will be shown at the bottom of the panel [Default]'},
        {value: 'top', description: 'Project Banner will be displayed on the top panel'}
      ]
    }
  },

  activate (state) {
    let panelPosition = atom.config.get('project-banner.panelPosition')
    let projectBannerView = new ProjectBannerView(state)
    let modalPanel = atom.workspace[`add${panelPosition === 'bottom' ? 'Bottom' : 'Top'}Panel`]({
      item: projectBannerView.getElement(),
      visible: state.isVisible
    })
    this.projectBannerView = projectBannerView
    this.modalPanel = modalPanel

    this.configVisibility = atom.config.get('project-banner.showProjectBanner')
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'project-banner:toggle': () => this.toggle()
    }))

    this.subscriptions.add((X => {
      let visiblityListener = () => this.updateVisibility()
      bconfigEmitter.on('config-update', visiblityListener)
      return {
        dispose () {
          bconfigEmitter.removeListner('config-update', visiblityListener)
        }
      }
    })())

    this.updateVisibility()
  },

  deactivate () {
    this.modalPanel.destroy()
    this.subscriptions.dispose()
    this.projectBannerView.destroy()
  },

  serialize () {
    return {
      projectBannerViewState: this.projectBannerView.serialize(),
      isVisible: this.modalPanel.isVisible()
    }
  },

  toggle () {
    atom.config.set('project-banner.showProjectBanner', !this.modalPanel.isVisible())
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    )
  },

  getVisibility () {
    return this.visibility
  },

  updateVisibility () {
    this.visibility = bconfig.loaded && this.configVisibility && bconfig.items && bconfig.items.length // && this.visibleMessages > 0 // for future use

    if (this.visibility) {
      this.modalPanel.show()
    } else {
      this.modalPanel.hide()
    }
  },
  consumeBanner (bannerService) {
  },
  consumeStatusBar (statusBar) {
  },
  provideBanner () {
    return this
  }

}

export default projectBanner
