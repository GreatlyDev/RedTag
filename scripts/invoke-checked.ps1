$ErrorActionPreference = "Stop"

function Invoke-RedTagNative {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][object[]]$Arguments
  )

  $application = Get-Command -Name $Name -CommandType Application -ErrorAction Stop | Select-Object -First 1
  & $application.Source @Arguments
  $exitCode = $LASTEXITCODE
  if ($exitCode -ne 0) { throw "$Name failed with exit code $exitCode" }
}

function git { Invoke-RedTagNative -Name "git" -Arguments $args }
function gh { Invoke-RedTagNative -Name "gh" -Arguments $args }
function pnpm { Invoke-RedTagNative -Name "pnpm" -Arguments $args }
function corepack { Invoke-RedTagNative -Name "corepack" -Arguments $args }
function node { Invoke-RedTagNative -Name "node" -Arguments $args }
function npx { Invoke-RedTagNative -Name "npx" -Arguments $args }
function rg { Invoke-RedTagNative -Name "rg" -Arguments $args }

function Assert-NoRgMatches {
  param(
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [Parameter(Mandatory = $true)][string]$FailureMessage
  )

  $application = Get-Command -Name "rg" -CommandType Application -ErrorAction Stop | Select-Object -First 1
  & $application.Source @Arguments
  $exitCode = $LASTEXITCODE
  if ($exitCode -eq 0) { throw $FailureMessage }
  if ($exitCode -ne 1) { throw "rg scan failed with exit code $exitCode" }
}
