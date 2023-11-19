#!/bin/bash

clear

rm backup/sql-files/*.*

export $(grep -v '^#' ./.env | xargs)

# printenv

while read f; do
  echo " - $f"

  /Applications/MySQLWorkbench.app/Contents/MacOS/mysqldump --host=$MYSQL_HOST --port=$MYSQL_PORT --password=$MYSQL_PASSWORD --user=$MYSQL_USER --protocol=tcp $MYSQL_DB --no-tablespaces --log-error=backup/sql-files/errors.log --result-file=backup/sql-files/$f.sql "$f"

done <backup/tables-list.txt

echo 'Process complete'
