module.exports = (app) => {
  const backup = require('../controllers/backup.controller')

  const router = require('express').Router()

  router.get('/backup', backup.createBackup)

  router.get('/zip', backup.zipBackup)

  router.get('/push', backup.pushBackup)

  router.get('/unzip', backup.unzipBackup)

  router.get('/restore', backup.restoreBackup)

  router.get('/test', backup.test)

  app.use('/api', router)
}
