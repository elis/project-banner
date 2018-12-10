'use babel'
import bconfig, { config } from './reads'
import { projectPath, eventEmitter as bconfigEmitter } from './reads'
import fs from 'fs'
import { CompositeDisposable } from 'atom'

const getFile = path => fs.readFileSync(path, { encoding: 'UTF8' })

export default class ProjectBannerView {
  constructor (serializedState) {
    // Create root element
    this.element = document.createElement('project-banner')

    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add((X => {
      let listener = () => this.update()
      bconfigEmitter.on('config-update', listener)
      return {
        dispose () {
          bconfigEmitter.removeListner('config-update', listener)
        }
      }
    })())
    this.update()
  }

  update () {
    this.element.innerHTML = ''
    if (bconfig.items && bconfig.items.length) {
      bconfig.items.map((el, index) => {
        const div = document.createElement('div')
        div.classList.add('el')
        div.classList.add(`n-${index}`)

        if (typeof el === 'string') {
          let parts = el.split('::')
          el = {
            type: parts.length > 1 ? parts[0] : 'text',
            [parts.length > 1 ? parts[0] : 'content']: `${parts.length > 1 ? parts[1] : el}`
          }
        }

        div.classList.add(`type-${el.type}`)

        if (el.classList) {
          el.classList.map(c => div.classList.add(c))
        }
        switch (el.type) {
          case 'svg':
            div.innerHTML = getFile(`${projectPath}/${el.path}`)
            break
          case 'text':
            const conf = config
            const evaled = eval('`' + el.content + '`')
            div.innerHTML = evaled
            break
          case 'icon':
            div.innerHTML = `<span class="icon icon-${el.icon}"></span>`
            break
          default:
            div.innerHTML = 'No type'
        }

        this.element.appendChild(div)
      })

      const themes = atom.config.get('core.themes')
      const isDark = themes[0] && themes[0].match(/dark/i) || !(themes[0].match(/light/i))
      const styles = bconfig && ((isDark && bconfig.darkStyles) || bconfig.styles)

      if (styles && styles.length) {
        if (!this.styleSheet) {
          const style = document.createElement('style')
          style.innerHTML = styles

          document.head.appendChild(style)

          this.styleSheet = style.sheet
        }

        styles.map((s, i) => {
          if (this.styleSheet.rules.length > i) this.styleSheet.removeRule(i)
          this.styleSheet.insertRule(s, i)
        })
      }
    }
  }

  // Returns an object that can be retrieved when package is activated
  serialize () {}

  // Tear down any state and detach
  destroy () {
    this.subscriptions.dispose()
    this.element.remove()
  }

  getElement () {
    return this.element
  }

}
