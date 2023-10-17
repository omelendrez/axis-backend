@echo off
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -h 127.0.0.1  -u axis_user --routines --column-statistics=0 --password=M1a4$1t4E8r0 --databases axis > axis.sql
