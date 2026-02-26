param(
  [int]$Rounds = 40,
  [int]$Limit = 5,
  [int]$RetryEvery = 8
)

$pair = "steve:123456"
$token = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($pair))
$headers = @{ Authorization = "Basic $token"; "Content-Type" = "application/json" }

for ($i = 1; $i -le $Rounds; $i++) {
  $bodyObj = @{ limit = $Limit }

  if ($RetryEvery -gt 0 -and $i % $RetryEvery -eq 0) {
    $bodyObj.retryMissing = $true
    $bodyObj.retryOnlyMissing = $true
    $bodyObj.retryOrder = "oldest"
  }

  $body = $bodyObj | ConvertTo-Json -Compress

  try {
    $resp = Invoke-RestMethod -Uri "http://localhost:3000/api/spell-reference-hydrate" -Method Post -Headers $headers -Body $body -TimeoutSec 240
    $processed = @($resp.processed)
    $saved = @($processed | Where-Object { $_.status -eq "saved" }).Count
    $notFound = @($processed | Where-Object { $_.status -eq "not-found" }).Count
    $skipped = @($processed | Where-Object { $_.status -eq "skipped" }).Count

    Write-Output ("[{0:00}] processed={1} saved={2} notFound={3} skipped={4}" -f $i, $processed.Count, $saved, $notFound, $skipped)

    if ($resp.error) {
      Write-Output ("[{0:00}] info={1}" -f $i, $resp.error)
    }
  }
  catch {
    Write-Output ("[{0:00}] error={1}" -f $i, $_.Exception.Message)
  }

  Start-Sleep -Seconds 1
}
