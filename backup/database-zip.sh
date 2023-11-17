while read p; do
  echo " - $p"

  tar -Pczf "$p.tar.gz" "$p.sql"

done <tables-list.txt

rm *.sql
