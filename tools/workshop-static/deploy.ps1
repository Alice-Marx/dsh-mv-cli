param(
    [Parameter(Mandatory=$true)][string]$Snapshot,
    [Parameter(Mandatory=$true)][string]$Server,
    [Parameter(Mandatory=$true)][string]$IdentityFile,
    [Parameter(Mandatory=$true)][string]$KnownHosts,
    [ValidatePattern('^[a-z_][a-z0-9_-]*$')][string]$User = 'root',
    [ValidateRange(1,65535)][int]$Port = 22,
    [switch]$Apply
)
$ErrorActionPreference = 'Stop'
if ($Server -notmatch '^[A-Za-z0-9.-]+$') { throw 'Unsafe server name' }
$snapshotRoot = (Resolve-Path -LiteralPath $Snapshot).Path
$identityPath = (Resolve-Path -LiteralPath $IdentityFile).Path
$knownHostsPath = (Resolve-Path -LiteralPath $KnownHosts).Path
if (-not (Test-Path -LiteralPath "$snapshotRoot/snapshot-manifest.json" -PathType Leaf)) { throw 'Prepared snapshot manifest is required' }
if (Get-ChildItem -LiteralPath $snapshotRoot -Recurse -Force | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }) { throw 'Snapshot links are not allowed' }
$manifest = Get-Content -LiteralPath "$snapshotRoot/snapshot-manifest.json" -Raw | ConvertFrom-Json
if ($manifest.format -ne 'dsh-mv-workshop-static-snapshot' -or $manifest.repository -ne 'Alice-Marx/dsh-mv-workshop') { throw 'Unexpected snapshot identity' }
$connection = "$User@$Server"
$sshOptions = @('-F','none','-i',$identityPath,'-o','IdentitiesOnly=yes','-o','BatchMode=yes','-o','ConnectTimeout=10','-o','StrictHostKeyChecking=yes','-o',"UserKnownHostsFile=$knownHostsPath",'-o','LogLevel=ERROR')
$publicRoot = '/srv/dsh-mv-workshop/public'
$stage = '/srv/dsh-mv-workshop/staging/' + (Get-Date -Format 'yyyyMMddTHHmmss') + '-' + [Guid]::NewGuid().ToString('N')
if (-not $Apply) {
    [pscustomobject]@{Apply=$false;Server=$Server;Port=$Port;PackCount=$manifest.packCount;ResourceCommit=$manifest.resourceCommit;PublicRoot=$publicRoot;Requires='Reviewed existing HTTPS location and confirmed SSH host key; pass -Apply only after approval'} | ConvertTo-Json
    return
}
# Credentials stay in the operator's existing local identity file. None are sent
# to GitHub Actions, embedded in a URL, included in this snapshot, or printed.
& ssh @sshOptions -p $Port $connection "umask 077; mkdir -p '$stage'"
if ($LASTEXITCODE -ne 0) { throw 'SSH staging failed; no public index changed' }
& scp @sshOptions -P $Port -r $snapshotRoot "${connection}:${stage}/snapshot"
if ($LASTEXITCODE -ne 0) { throw 'Snapshot upload failed; no public index changed' }
$activate = Get-Content -LiteralPath "$PSScriptRoot/activate.py" -Raw
$activate | & ssh @sshOptions -p $Port $connection "python3 - '$stage/snapshot' '$publicRoot'"
if ($LASTEXITCODE -ne 0) { throw 'Server snapshot verification failed; no public index changed' }
$activate | & ssh @sshOptions -p $Port $connection "python3 - '$stage/snapshot' '$publicRoot' --apply"
if ($LASTEXITCODE -ne 0) { throw 'Snapshot publication failed; inspect retained staging and prior index' }
