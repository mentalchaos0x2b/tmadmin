@echo off
net stop spooler
del %systemroot%\system32\spool\printers\*.shd
del %systemroot%\system32\spool\printers\*.spl
net start spooler
msg "%username%" "TMAdmin: The script for restarting the print manager has been executed"
pause
exit /b 0
