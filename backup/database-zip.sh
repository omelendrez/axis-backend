#!/bin/bash

rm *.gz

while read p; do
  echo " - $p"

  tar -Pczf "backup/zip-files/$p.tar.gz" "backup/sql-files/$p.sql"

done <backup/tables-list.txt

rm backup/sql-files/*.sql
