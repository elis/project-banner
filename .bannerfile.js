exports = {
  actions: {
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
