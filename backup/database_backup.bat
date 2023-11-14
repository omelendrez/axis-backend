@echo off

for /f %%F in (tables-list.txt) do "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -h 127.0.0.1  -u root --routines --column-statistics=0 --password=M1a4$1t4E8r0 axis --result-file=%%F.sql "%%F"

for /f %%F in (tables-list.txt) do tar -cvzf %%F.tar.gz %%F.sql

del *.sql

git add .
git commit -m "Add backup files"
git push

pause
