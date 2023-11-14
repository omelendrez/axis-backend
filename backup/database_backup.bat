@echo off
@REM "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -h 127.0.0.1  -u root --no-data --routines --column-statistics=0 --password=M1a4$1t4E8r0 axis --result-file=axis-defs.sql
@REM "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -h 127.0.0.1  -u root --no-create-info --routines --column-statistics=0 --password=M1a4$1t4E8r0 axis --result-file=axis-data.sql
@REM tar -cvzf axis-defs.tar.gz axis-defs.sql
@REM tar -cvzf axis-data.tar.gz axis-data.sql
@REM del *.sql

@REM git add .
@REM git commit -m "Add backup files"
@REM git push

for /d %%F in ("tables-list.tst") do call echo "%%F"

pause
