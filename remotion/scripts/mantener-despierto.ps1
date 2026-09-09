# Mantiene la máquina despierta (no la pantalla) mientras el log del render no diga "== fin".
# Es una petición del proceso (SetThreadExecutionState): se revierte sola al terminar. No cambia la configuración de energía.
param([string]$log)
$def = "[DllImport(`"kernel32.dll`")] public static extern uint SetThreadExecutionState(uint esFlags);"
$t = Add-Type -MemberDefinition $def -Name Energia -Namespace Tuvetia -PassThru
[void]$t::SetThreadExecutionState([uint32]0x80000003)
while (-not (Select-String -Path $log -Pattern "== fin" -Quiet -ErrorAction SilentlyContinue)) { Start-Sleep -Seconds 30 }
[void]$t::SetThreadExecutionState([uint32]0x80000000)
