$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\Samee\AppData\Local\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;" + $env:Path

Write-Host "Building Standalone Release APK..." -ForegroundColor Cyan
Set-Location android
.\gradlew.bat app:assembleRelease

if ($LASTEXITCODE -eq 0) {
    Set-Location ..
    Copy-Item "android\app\build\outputs\apk\release\app-release.apk" -Destination "Kepza.apk" -Force
    Write-Host "`nSUCCESS! Standalone APK created at:" -ForegroundColor Green
    Write-Host "  -> C:\Users\Samee\Desktop\Kepza\Kepza.apk" -ForegroundColor Yellow
} else {
    Write-Host "`nBuild failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
