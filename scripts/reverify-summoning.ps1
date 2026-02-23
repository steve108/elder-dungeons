$targets = @(
  @{ name = 'Animal Summoning I'; spellClass = 'divine' },
  @{ name = 'Animal Summoning II'; spellClass = 'divine' },
  @{ name = 'Animal Summoning III'; spellClass = 'divine' },
  @{ name = 'Monster Summoning I'; spellClass = 'arcane' },
  @{ name = 'Monster Summoning II'; spellClass = 'arcane' },
  @{ name = 'Monster Summoning III'; spellClass = 'arcane' },
  @{ name = 'Monster Summoning IV'; spellClass = 'arcane' },
  @{ name = 'Monster Summoning V'; spellClass = 'arcane' },
  @{ name = 'Monster Summoning VI'; spellClass = 'arcane' },
  @{ name = 'Monster Summoning VII'; spellClass = 'arcane' },
  @{ name = 'Aerial Servant'; spellClass = 'divine' },
  @{ name = 'Conjure Animals'; spellClass = 'divine' },
  @{ name = 'Invisible Stalker'; spellClass = 'arcane' },
  @{ name = 'Summon Insects'; spellClass = 'divine' }
)

$idx = 0
foreach ($t in $targets) {
  $idx++
  $normalized = ($t.name.ToLower().Trim() -replace "[^a-z0-9\s'\-]", '' -replace "\s+", ' ')

  $sql = @"
DELETE FROM "Spell" WHERE LOWER(TRIM(name)) = '$normalized' AND spell_class = '$($t.spellClass)';
DELETE FROM "SpellReferenceMissing" WHERE "normalized_name" = '$normalized' AND "spell_class" = '$($t.spellClass)';
"@

  $sql | npx prisma db execute --stdin | Out-Null

  $body = (@{
    name = $t.name
    spellClass = $t.spellClass
    limit = 1
    retryMissing = $true
  } | ConvertTo-Json -Compress)
  $body | Set-Content -LiteralPath .\tmp-hydrate-body.json -NoNewline
  $raw = curl.exe -s -u steve:123456 -H "content-type: application/json" --data-binary "@tmp-hydrate-body.json" "http://localhost:3000/api/spell-reference-hydrate"

  try {
    $obj = $raw | ConvertFrom-Json
    $first = @($obj.processed)[0]
    if ($null -ne $first) {
      $matchedUrl = ""
      if ($first.PSObject.Properties.Name -contains "matchedUrl" -and $null -ne $first.matchedUrl) {
        $matchedUrl = [string]$first.matchedUrl
      }
      Write-Output ("[{0:00}/{1}] {2} ({3}) -> {4} {5}" -f $idx, $targets.Count, $t.name, $t.spellClass, $first.status, $matchedUrl)
    } else {
      Write-Output ("[{0:00}/{1}] {2} ({3}) -> no-result" -f $idx, $targets.Count, $t.name, $t.spellClass)
    }
  }
  catch {
    Write-Output ("[{0:00}/{1}] {2} ({3}) -> parse-error" -f $idx, $targets.Count, $t.name, $t.spellClass)
  }
}

Remove-Item -LiteralPath .\tmp-hydrate-body.json -Force -ErrorAction SilentlyContinue
