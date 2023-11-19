while read p; do
  echo " - $p"

  tar -Pxzf "backup/zip-files/$p.tar.gz" "backup/sql-files/"

done <backup/tables-list.txt

# rm *.gz
