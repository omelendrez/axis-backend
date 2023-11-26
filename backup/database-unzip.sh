while read p; do
  echo " - $p"

  tar -Pxzf "zip-files/$p.tar.gz" "sql-files/"

done <tables-list.txt

# rm *.gz
