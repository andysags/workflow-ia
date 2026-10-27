#!/usr/bin/env bash
# Tests ciblés d'un agent de workflow-ia, sur une fixture : quelques centimes au lieu d'un pipeline complet.
#
# Usage :
#   banc-essai/tester-agent.sh                    # tous les tests de banc-essai/agents/
#   banc-essai/tester-agent.sh securite-paiement  # un test précis
#
# Chaque test est un dossier banc-essai/agents/<test>/ avec :
#   projet/      le dossier projet donné à l'agent (copié avant chaque essai, jamais modifié)
#   attendu.md   en-tête : agent, consigne, fichier produit, et les contrôles (tous facultatifs) :
#                statut   ligne de statut attendue dans la réponse ou le livrable
#                mots     expressions régulières qui doivent apparaître dans le livrable
#                interdits expressions régulières qui ne doivent PAS y apparaître (faits inventés…)
#                fichiers "<motif> = <nombre>" : nombre de fichiers attendus, relatif au dossier projet

set -uo pipefail
RACINE="$(cd "$(dirname "$0")/.." && pwd)"
BANC="$RACINE/banc-essai"
PLUGINS="${PLUGINS:-$RACINE/plugins}"
SORTIE="${SORTIE:-$BANC/resultats/agents-$(date +%Y-%m-%d_%H-%M)}"
if [ $# -gt 0 ]; then tests=("$@"); else tests=($(cd "$BANC/agents" && ls)); fi

champ() { awk -v c="$1" 'BEGIN{n=0} /^---$/{n++; next} n==1 && $0 ~ "^"c":" {sub("^"c":[ ]*",""); gsub(/^"|"$/,""); print}' "$2"; }
liste() { awk -v c="$1" 'BEGIN{n=0;m=0} /^---$/{n++; next} n==1 && $0 ~ "^"c":"{m=1; next} n==1 && m && /^  - /{sub(/^  - /,""); gsub(/^"|"$/,""); gsub(/\\\\/,"\\"); print; next} n==1 && m{m=0}' "$2"; }

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
      --output-format stream-json --verbose > run.jsonl 2> run.err )
  rapport="$D/projet/$fichier"; ok=1; notes=()
  if [ ! -f "$rapport" ]; then notes+=("❌ livrable $fichier absent"); ok=0; fi
  if [ -n "$statut" ]; then
    if grep -q "$statut" "$D/run.jsonl" 2>/dev/null || grep -q "$statut" "$rapport" 2>/dev/null; then notes+=("✅ statut $statut"); else notes+=("❌ statut (attendu « $statut »)"); ok=0; fi
  fi
  while IFS= read -r m; do
    [ -z "$m" ] && continue
    if grep -qiE "$m" "$rapport" 2>/dev/null; then notes+=("✅ $m"); else notes+=("❌ absent : $m"); ok=0; fi
  done < <(liste mots "$A")
  while IFS= read -r m; do
    [ -z "$m" ] && continue
    # On ignore les exemples de format (`3 500 FCFA`) et les emplacements [À COMPLÉTER : …] : ce ne sont pas des faits.
    trouve="$(sed -E 's/`[^`]*`//g; s/\[À COMPLÉTER[^]]*\]//g' "$rapport" 2>/dev/null | grep -oiE "$m" | head -1)"
    if [ -z "$trouve" ]; then notes+=("✅ pas de : $m"); else notes+=("❌ interdit trouvé : « $trouve »"); ok=0; fi
  done < <(liste interdits "$A")
  while IFS= read -r m; do
    [ -z "$m" ] && continue
    motif="${m% = *}"; attendu="${m##* = }"
    n=$( (cd "$D/projet" && compgen -G "$motif") | wc -l)
    if [ "$n" = "$attendu" ]; then notes+=("✅ $motif : $n fichier(s)"); else notes+=("❌ $motif : $n fichier(s), $attendu attendu(s)"); ok=0; fi
  done < <(liste fichiers "$A")
  cout="$(node -e 'try{const l=require("fs").readFileSync(process.argv[1],"utf8").trim().split("\n").map(JSON.parse).filter(e=>e.type==="result").pop();console.log((l?.total_cost_usd??0).toFixed(2))}catch{console.log("?")}' "$D/run.jsonl")"
  [ $ok = 1 ] && echo "✔ $t réussi ($cout \$)" || { echo "✘ $t échoué ($cout \$)"; echec=1; }
  printf '   %s\n' "${notes[@]}"
done
exit $echec
