@echo off
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -h roundhouse.proxy.rlwy.net --port 49881  -u root --tables --routines --triggers --column-statistics=0 --compact  railway --result-file=railway.sql
pause
