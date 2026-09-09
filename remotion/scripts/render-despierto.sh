#!/bin/bash
# Render con la máquina despierta: lanza scripts/mantener-despierto.ps1 sobre el log del render y corre el render.
cd "C:/Users/User/OneDrive - Esguerra JHR/Escritorio/Vetnia/tuvetia-marketing/remotion"
log="$1"; shift
: > "$log"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mantener-despierto.ps1 "$log" > /dev/null 2>&1 &
bash "$@" >> "$log" 2>&1
