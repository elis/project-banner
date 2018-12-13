const { exec } = require('child_process')

exports = {
  actions: {
    publish: function () {
      console.log('this state:', this.Reader)
      const publish = (type, notif) => {
        console.log('gonna publish a new version', type, 'for this project')
        exec(`apm publish ${type}`, {
          cwd: this.Reader.projectPath
        }, (err, stdout, stderr) => {
          console.log('execution result:', stdout)
        })
        notif.dismiss()
      }

      const types = {major: 'Major', minor: 'Minor', patch: 'Patch'}
      const ask = (type, notif) => {
        const big = types[type]
        if (!big) throw new Error('Unknown publish type')

        const confirm = atom.notifications.addWarning(`Publish ${big}`, {
          description: `Are you sure you want to publish a "${type}" update for Project Banner at this time?\nPlease make sure that the directory is clean and there are no unstaged files before proceeding.`,
          dismissable: true,
          buttons: [
            {text: 'Cancel', onDidClick: () => confirm.dismiss(), className: 'btn btn-primary'},
            {text: 'Upgrade and Publish', onDidClick: () => publish(type, confirm), className: 'btn btn-success'},
          ]
        })
        notif.dismiss()
      }

      const major = notif => ask('major', notif)
      const minor = notif => ask('minor', notif)
      const patch = notif => ask('patch', notif)
      const cancel = () => { notification.dismiss() }
      const notification = atom.notifications.addInfo('Publish Version', {
        description: 'You want to publish a version?',
        dismissable: true,
        buttons: [
          {text: 'Cancel', onDidClick: cancel, className: 'btn btn-lg btn-primary btn-block'},
          {text: 'Patch', onDidClick: () => patch(notification), className: 'btn btn-sm'},
          {text: 'Minor', onDidClick: () => minor(notification), className: 'btn btn-sm'},
          {text: 'Major', onDidClick: () => major(notification), className: 'btn btn-xs'},
        ]
      })
    },
    doSomething: function () {
      console.log('what is this?', this)
      this.projectBanner.doUpdate()
    }
  },
  content: {
    projectFlag: function () {
      console.log('what is this?', this)
      return Date.now()
    }
  }
}
