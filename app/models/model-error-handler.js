const { sendError } = require('../errors/error-monitoring')

const ModelErrorHandler = {
  /**
   *
   * @param {string} methodName
   * @param {object} errorObject
   * @param {function} callback
   * Sends the method name and error object by email to me
   * Then executes the call back that returns the error object to the controller
   */

  handleError: (methodName, errorObject, callback) => {
    sendError(methodName, errorObject)
    callback(errorObject, null)
  }
}
module.exports = ModelErrorHandler
