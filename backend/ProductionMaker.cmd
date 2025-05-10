copy .\main.py ..\PRODUCTION\
copy .\.env ..\PRODUCTION\
copy .\requirements.txt ..\PRODUCTION\
xcopy /D /F /Q /I ..\build ..\PRODUCTION\build