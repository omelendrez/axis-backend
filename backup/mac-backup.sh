clear

while read f; do
  echo " - $f"

/Applications/MySQLWorkbench.app/Contents/MacOS/mysqldump  --host=roundhouse.proxy.rlwy.net --port=49881 --password=21c16gef3Gcba4cF6fDB25ggeDc6gEC5 --default-character-set=utf8 --user=root --protocol=tcp "railway" --log-error=errors.log --result-file=$f.sql "$f"

done < tables-list.txt
