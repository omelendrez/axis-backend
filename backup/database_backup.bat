@echo off
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -h 127.0.0.1  -u root --no-data --routines --column-statistics=0 --password=M1a4$1t4E8r0 axis --result-file=axis-defs.sql
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -h 127.0.0.1  -u root --no-create-info --routines --column-statistics=0 --password=M1a4$1t4E8r0 axis --result-file=axis-data.sql
tar -cvzf axis-defs.tar.gz axis-defs.sql
tar -cvzf axis-data.tar.gz axis-data.sql
del *.sql
pause
