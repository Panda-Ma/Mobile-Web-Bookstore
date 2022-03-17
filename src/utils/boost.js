/* eslint-disable no-extend-native */
Array.prototype.pushWithoutDuplicate = function () {
  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i]
    //this指向数组
    if (this.indexOf(arg) === -1) {
      this.push(arg)
    }
  }
}
