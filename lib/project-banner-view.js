'use babel'
import fs from 'fs'
import { CompositeDisposable } from 'atom'
import * as Reader from './reader'

const getFile = path => fs.readFileSync(path, { encoding: 'UTF8' })

const defaultSettings = {
  configPath: undefined
}
const settings = Object.assign(
  {},
  defaultSettings,
  fs.existsSync(Reader.packageFile) && require(Reader.packageFile).projectBanner || {}
)

export default class ProjectBannerView {
  constructor (serializedState) {
    // Create root element
    this.element = document.createElement('project-banner')
    this.state = { }
    let listener = () => this.update()

    // On config update
    this.subscriptions = new CompositeDisposable()

    // On theme switch
    this.subscriptions.add(atom.themes.onDidChangeActiveThemes(listener))

    Reader.discoverConfig(settings.configPath).then(configs => {
      console.log('known configs:', configs)
      if (configs && configs.length) {
        const executables = configs.find(c => ['js', 'coffee'].indexOf(c.split('.').pop()) >= 0)
        if (executables) {
          let allowExecution = atom.config.get('project-banner.allowExecution')
          let denyExecution = atom.config.get('project-banner.denyExecution') || []

          if (denyExecution.indexOf(Reader.projectPath) ==- 1 && (!allowExecution || !allowExecution.length || allowExecution.indexOf(Reader.projectPath) === -1)) {
            this.requestExecutableAccess()
          }
        }
        configs.map(filename => {
          const sub = Reader.watchConfig(filename, this.configUpdated)
          this.subscriptions.add(sub)
        })
      }
    })
    let allowExecution = atom.config.get('project-banner.allowExecution')
    let denyExecution = atom.config.get('project-banner.denyExecution') || []

    if (denyExecution.indexOf(Reader.projectPath) ==- 1 && (!allowExecution || !allowExecution.length || allowExecution.indexOf(Reader.projectPath) === -1)) {
      this.requestExecutableAccess()
    }
    this.subscriptions.add(Reader.watchConfig(Reader.packageFile, this.packgeJsonUpdated))
    this.update()
  }

  configUpdated = (data) => {
    if (data && Object.keys(data).length) {
      Object.assign(this.state, data)
      this.doUpdate()
    }
  }
  packgeJsonUpdated = (data) => {
    if (data && Object.keys(data).length) {
      Object.assign(this.state, {'package.json': data})
      this.doUpdate()
    }
  }

  requestExecutableAccess = () => {
    const allow = () => {
      let allowExecution = atom.config.get('project-banner.allowExecution') || []
      atom.config.set('project-banner.allowExecution', [...allowExecution.filter(e => e !== Reader.projectPath), Reader.projectPath])
      atom.notifications.addSuccess('Execution on project is now allowed', {
        description: 'For security reasons you\'ll need to reload the window',
        buttons: [
          {onDidClick: () => atom.reload(), text: 'Reload Window'}
        ]
      })
    }
    const deny = () => {
      let denyExecution = atom.config.get('project-banner.denyExecution') || []
      atom.config.set('project-banner.denyExecution', [...denyExecution.filter(e => e !== Reader.projectPath), Reader.projectPath])
      atom.notifications.addWarning('Execution on project is denied', {
        description: 'This might effect how the extension works - to renable Project Banner execution remove project path from Project Banner settings'
      })
    }
    atom.notifications.addInfo('Project contains executables', {
      description: 'This project contains executable Project Banner settings - if you trust this project you can allow executables now',
      details: 'For your security executables are denied by default.',
      buttons: [
        {text: 'Allow', onDidClick: allow},
        {text: 'Deny', onDidClick: deny}
      ]
    })
  }
  doUpdate () {
    const { state } = this

    const allowExecution = atom.config.get('project-banner.allowExecution') || []
    const exec = allowExecution.indexOf(Reader.projectPath) !== -1

    this.element.innerHTML = ''
    if (state.items && state.items.length) {
      state.items.map((el, index) => {
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
        const context = {
          projectBanner: this,
          Reader,
          state,
          item: el,
          element: div
        }
        switch (el.type) {
          case 'svg':
            div.innerHTML = getFile(`${Reader.projectPath}/${el.path}`)
            break
          case 'text':
            if (el.content) {
              if (exec) {
                with (context) {
                  const evaled = eval('`' + el.content + '`')
                  div.innerHTML = evaled
                }
              } else {
                div.innerHTML = el.content
              }
            }
            else if (el.getContent) {
              if (exec) {
                with (context) {
                  try {
                    const evaled = eval(el.getContent)
                    const executable = (...args) => {
                      with (context) {
                        return evaled.bind({...context})(...args)
                      }
                    }
                    const content = executable()
                    div.innerHTML = content
                  } catch (err) {
                    console.error('Unable to execute content', err)
                  }
                }
              } else {
                div.innerHTML = el.getContent
              }
            }
            break
          case 'icon':
            div.innerHTML = `<span class="icon icon-${el.icon}"></span>`
            break
          default:
            div.innerHTML = 'No type'
        }

        this.element.appendChild(div)
        if (el.onClick && exec) {
          with (context) {
            try {
              const evaled = eval(el.onClick)
              const executable = (...args) => {
                with (context) {
                  return evaled.bind({...context})(...args)
                }
              }
              div.addEventListener('click', executable)
            } catch (err) {
              console.error('Unable to attach event', err)
              div.addEventListener('click', () => {
                console.error('Execution failed.', err)
              })
            }
          }
          div.classList.add('clickable')
        }
        if (el.events && exec) {
          const events = Object.keys(el.events)
          if (events.length) {
            events.map(event => {
              try {
                with ({...context, event}) {
                  const evaled = eval(el.events[event])
                  const executable = (...args) => {
                    with (context) {
                      return evaled.bind({...context})(...args)
                    }
                  }
                  div.addEventListener(event, executable)
                }
              } catch (err) {
                console.error('Unable to attach event', err)
                div.addEventListener('click', () => {
                  console.error('Execution failed.', err)
                })
              }
            })
          }
        }
      })

      const themes = atom.config.get('core.themes')
      const isDark = themes[0] && themes[0].match(/dark/i) || !(themes[0].match(/light/i))
      const { styles } = state // && ((isDark && bconfig.darkStyles) || bconfig.styles)

      this.element.classList[isDark ? 'add' : 'remove']('dark')

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

  update () {
    try {
      this.doUpdate()
    } catch (err) {
      console.log('Error do update:', err)
    }
  }

  // Returns an object that can be retrieved when package is activated
  serialize () { }

  // Tear down any state and detach
  destroy () {
    this.subscriptions.dispose()
    this.element.remove()
  }

  getElement () {
    return this.element
  }

}
