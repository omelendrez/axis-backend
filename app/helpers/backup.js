const fs = require('fs')
const FormData = require('form-data')
const { api } = require('../services/documentsClient')

const FILE_NAME = 'axis.sql'

const LIMIT = 5000
const TABLE_LIST_FILE = './backup/tables-list.txt'

const HEADER = `/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;\n
LOCK TABLES \`{table}\` WRITE;
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
TRUNCATE TABLE \`{table}\`;
UNLOCK TABLES;
LOCK TABLES \`{table}\` WRITE;
SET FOREIGN_KEY_CHECKS = 0;\n`

const FOOTER = `SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;
UNLOCK TABLES;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;\n`

const uploadSqlFile = async (filePath, destinationPath) => {
  try {
    const file = fs.createReadStream(filePath)
    const name = filePath.split('/').pop().replace('.sql', '')

    const form = new FormData()
    form.append('name', name)
    form.append('file', file)

    await api.post(destinationPath, form)

    fs.unlinkSync(filePath)
  } catch (err) {
    console.log(err.message)
  }
}

module.exports = {
  FILE_NAME,
  LIMIT,
  TABLE_LIST_FILE,
  HEADER,
  FOOTER,
  uploadSqlFile
}
