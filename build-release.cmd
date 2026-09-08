@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=C:\Users\Samee\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

echo Building Standalone Release APK...
cd /d "%~dp0android"
call gradlew.bat app:assembleRelease

if %ERRORLEVEL% equ 0 (
    copy /y "%~dp0android\app\build\outputs\apk\release\app-release.apk" "%~dp0Kepza.apk"
    echo.
    echo ============================================================
    echo SUCCESS! Standalone APK created at:
    echo   %~dp0Kepza.apk
    echo ============================================================
) else (
    echo.
    echo Build failed with error code %ERRORLEVEL%
)
pause
