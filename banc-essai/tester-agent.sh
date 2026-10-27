#!/usr/bin/env bash
# Tests ciblés d'un agent de workflow-ia, sur une fixture : quelques centimes au lieu d'un pipeline complet.
#
# Usage :
#   banc-essai/tester-agent.sh                    # tous les tests de banc-essai/agents/
#   banc-essai/tester-agent.sh securite-paiement  # un test précis
#
# Chaque test est un dossier banc-essai/agents/<test>/ avec :
#   projet/      le dossier projet donné à l'agent (copié avant chaque essai, jamais modifié)
#   attendu.md   en-tête : agent, consigne, fichier produit, statut attendu, mots attendus (expressions régulières)

set -uo pipefail
RACINE="$(cd "$(dirname "$0")/.." && pwd)"
BANC="$RACINE/banc-essai"
PLUGINS="${PLUGINS:-$RACINE/plugins}"
SORTIE="${SORTIE:-$BANC/resultats/agents-$(date +%Y-%m-%d_%H-%M)}"
if [ $# -gt 0 ]; then tests=("$@"); else tests=($(cd "$BANC/agents" && ls)); fi

champ() { awk -v c="$1" 'BEGIN{n=0} /^---$/{n++; next} n==1 && $0 ~ "^"c":" {sub("^"c":[ ]*",""); gsub(/^"|"$/,""); print}' "$2"; }
mots() { awk 'BEGIN{n=0;m=0} /^---$/{n++; next} n==1 && /^mots:/{m=1; next} n==1 && m && /^  - /{sub(/^  - /,""); gsub(/^"|"$/,""); gsub(/\\\\/,"\\"); print; next} n==1 && m{m=0}' "$1"; }

echec=0
for t in "${tests[@]}"; do
  A="$BANC/agents/$t/attendu.md"
  [ -f "$A" ] || { echo "Test inconnu : $t" >&2; echec=1; continue; }
  D="$SORTIE/$t"; mkdir -p "$D"; cp -r "$BANC/agents/$t/projet" "$D/projet"
  agent="$(champ agent "$A")"; consigne="$(champ consigne "$A")"; fichier="$(champ fichier "$A")"; statut="$(champ statut "$A")"
  echo "▶ $t (agent $agent)"
  ( cd "$D" && claude -p "Lance l'agent workflow-ia:$agent avec l'outil Agent. Dossier projet : $D/projet. Consigne : $consigne Recopie ensuite sa dernière ligne de statut telle quelle, sans rien faire d'autre." \
      --plugin-dir "$PLUGINS" --permission-mode acceptEdits \
      --allowedTools Read Write Edit Glob Grep Agent "Bash(npm *)" "Bash(npx *)" "Bash(node *)" "Bash(git *)" "Bash(ls *)" "Bash(cat *)" "Bash(grep *)" \
      --output-format json > run.json 2> run.err )
  rapport="$D/projet/$fichier"; ok=1; notes=()
  if grep -q "$statut" "$D/run.json" 2>/dev/null || grep -q "$statut" "$rapport" 2>/dev/null; then notes+=("statut ✅"); else notes+=("statut ❌ (attendu « $statut »)"); ok=0; fi
  while IFS= read -r m; do
    [ -z "$m" ] && continue
    if grep -qiE "$m" "$rapport" 2>/dev/null; then notes+=("✅ $m"); else notes+=("❌ $m"); ok=0; fi
  done < <(mots "$A")
  cout="$(node -e 'try{const r=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));console.log((r.total_cost_usd??0).toFixed(2))}catch{console.log("?")}' "$D/run.json")"
  [ $ok = 1 ] && echo "✔ $t réussi ($cout \$)" || { echo "✘ $t échoué ($cout \$)"; echec=1; }
  printf '   %s\n' "${notes[@]}"
done
exit $echec
