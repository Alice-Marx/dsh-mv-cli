param(
    [Parameter(Mandatory=$true)][string]$Repo,
    [Parameter(Mandatory=$true)][string]$OutputParent,
    [Parameter(Mandatory=$true)][string]$Server,
    [Parameter(Mandatory=$true)][string]$IdentityFile,
    [Parameter(Mandatory=$true)][string]$KnownHosts,
    [string]$Sources,
    [string]$User = 'root',
    [ValidateRange(1,65535)][int]$Port = 22,
    [switch]$Apply
)
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path -LiteralPath $Repo).Path
$outputRoot = (Resolve-Path -LiteralPath $OutputParent).Path
$origin = & git -C $repoRoot remote get-url origin
if ($LASTEXITCODE -ne 0 -or $origin -notin @('https://github.com/Alice-Marx/dsh-mv-workshop.git','https://github.com/Alice-Marx/dsh-mv-workshop')) { throw 'Only the official workshop repository is allowed' }
# Fetch only official main into FETCH_HEAD: do not reset user changes, push refs,
# delete branches/tags, execute repository scripts, or send the SSH identity to CI.
& git -C $repoRoot fetch --no-tags 'https://github.com/Alice-Marx/dsh-mv-workshop.git' main
if ($LASTEXITCODE -ne 0) { throw 'Official GitHub fetch failed; previously published index remains unchanged' }
$output = Join-Path $outputRoot ('workshop-static-' + (Get-Date -Format 'yyyyMMddTHHmmss') + '-' + [Guid]::NewGuid().ToString('N'))
$prepareArguments = @("$PSScriptRoot/prepare.mjs",'--repo',$repoRoot,'--ref','FETCH_HEAD','--out',$output)
if ($Sources) { $prepareArguments += @('--sources',(Resolve-Path -LiteralPath $Sources).Path) }
& node @prepareArguments
if ($LASTEXITCODE -ne 0) { throw 'Pinned snapshot validation failed; previously published index remains unchanged' }
$deployment = @{Snapshot=$output;Server=$Server;IdentityFile=$IdentityFile;KnownHosts=$KnownHosts;User=$User;Port=$Port;Apply=$Apply}
& "$PSScriptRoot/deploy.ps1" @deployment
