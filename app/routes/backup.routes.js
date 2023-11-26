const auth = require('../middleware/auth')

const secure = auth.validateToken

module.exports = (app) => {
  const backup = require('../controllers/backup.controller')

  const router = require('express').Router()

  router.post('/backup', secure, backup.createBackup)

  router.post('/zip', secure, backup.zipBackup)

  router.post('/push', secure, backup.pushBackup)

  router.post('/unzip', secure, backup.unzipBackup)

  router.post('/restore', secure, backup.restoreBackup)

  router.post('/test', secure, backup.test)

  app.use('/api/backup', router)
}
