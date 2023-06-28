module.exports = {
  socket: null,

  set(socket) {
    this.socket = socket
  },

  notify(type, message) {
    this.socket.broadcast.emit(type, message)
  }
}
