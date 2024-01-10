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

  router.get(
    '/generate-delete-foreignkeys-file',
    secure,
    backup.generateForeingKeysDeleteFile
  )

  router.get(
    '/generate-create-foreignkeys-file',
    secure,
    backup.generateForeingKeysCreateFile
  )

  router.get(
    '/generate-create-indexes-file',
    secure,
    backup.generateIndexesCreateFile
  )

  router.get(
    '/generate-delete-indexes-file',
    secure,
    backup.generateIndexesDeleteFile
  )

  app.use('/api/backup', router)
}
