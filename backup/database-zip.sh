#!/bin/bash

rm *.gz

while read p; do
  echo " - $p"

  tar -Pczf "zip-files/$p.tar.gz" "sql-files/$p.sql"

done <tables-list.txt

rm sql-files/*.sql
