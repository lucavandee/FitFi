#!/usr/bin/env bash
# Vult product_attributes per retailer via de Management API (supabase db query).
# De API heeft een tijdslimiet per query waarvan het getal niet in onze
# documentatie staat. Daarom: per retailer, en als een retailer op de limiet
# loopt, in vier merk-ranges. Idempotent: opnieuw draaien is veilig.
#
# Gebruik: scripts/keten/vul-attributes.sh            (alle retailers)
#          scripts/keten/vul-attributes.sh "H&M (NL)"  (een retailer)
set -u

RETAILERS=(
  "The New Originals (NL)"
  "OFM."
  "Mart Visser"
  "PUMA (EU) - USD"
  "H&M (NL)"
  "Giglio (INT)"
)
if [ $# -ge 1 ]; then RETAILERS=("$1"); fi

# Merk-ranges: lower(brand) >= van en < tot; de laatste range heeft geen bovengrens.
RANGES=("|g" "g|n" "n|t" "t|")

draai() {
  local sql="$1"
  supabase db query --linked "set statement_timeout = '15min'; $sql" -o table 2>&1 | grep -v "new version\|recommend updating"
}

for r in "${RETAILERS[@]}"; do
  echo "== $r =="
  start=$(date +%s)
  uit=$(draai "select * from vul_product_attributes('$r')")
  echo "$uit"
  if echo "$uit" | grep -qi "timeout\|canceling statement\|context deadline\|unexpected status 5"; then
    echo "-- tijdslimiet, opnieuw in vier merk-ranges"
    for range in "${RANGES[@]}"; do
      van="${range%%|*}"; tot="${range##*|}"
      van_sql=$([ -z "$van" ] && echo "null" || echo "'$van'")
      tot_sql=$([ -z "$tot" ] && echo "null" || echo "'$tot'")
      echo "-- range [$van, $tot)"
      draai "select * from vul_product_attributes('$r', $van_sql, $tot_sql)"
    done
  fi
  echo "-- duur: $(( $(date +%s) - start )) s"
done
