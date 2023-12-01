#!/bin/bash

clear

export $(grep -v '^#' ./.env | xargs)

# printenv

mkdir -p -- backup/sql-files/$(date +"%Y-%m-%d")

while read f; do
  echo " - $f"

  /usr/local/mysql/bin/mysqldump --host=$RAILWAY_MYSQL_HOST --port=$RAILWAY_MYSQL_PORT --password=$RAILWAY_MYSQL_PASSWORD --user=$RAILWAY_MYSQL_USER --protocol=tcp $RAILWAY_MYSQL_DB --no-tablespaces --log-error=backup/sql-files/errors.log --result-file=backup/sql-files/$(date +"%Y-%m-%d")/$f.sql "$f"

done <backup/tables-list.txt

echo 'Process complete'
