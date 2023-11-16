while read p; do
  echo " - $p"

 tar -Pxzf "$p.tar.gz"

done < tables-list.txt

rm *.gz
