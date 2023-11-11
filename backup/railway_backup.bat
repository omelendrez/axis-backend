@echo off
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -h roundhouse.proxy.rlwy.net --port 49881 --password=21c16gef3Gcba4cF6fDB25ggeDc6gEC5 -u root --routines --column-statistics=0 --compact railway --result-file=railway.sql
pause
