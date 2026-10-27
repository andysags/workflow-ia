#!/usr/bin/env bash
# Banc d'essai de workflow-ia : lance /workflow-ia:creer-site --auto sur des cas de référence,
# puis produit un rapport comparatif (rapport.md et rapport.json).
#
# Usage :
#   banc-essai/lancer.sh                       # les 10 cas, l'un après l'autre
#   banc-essai/lancer.sh restaurant-cotonou    # un ou plusieurs cas précis
#   PARALLELE=3 banc-essai/lancer.sh           # jusqu'à 3 cas en même temps
#   MODELE=claude-sonnet-5-5 banc-essai/lancer.sh  # forcer un modèle
#
# Coût : une exécution complète coûte plusieurs dollars par cas (environ 4 $ mesurés sur le premier test).
# Les commandes autorisées sont limitées à la liste ALLOWED ci-dessous ; rien d'autre ne s'exécute sans accord.

set -euo pipefail

RACINE="$(cd "$(dirname "$0")/.." && pwd)"
BANC="$RACINE/banc-essai"
SORTIE="${SORTIE:-$BANC/resultats/$(date +%Y-%m-%d_%H-%M)}"
PARALLELE="${PARALLELE:-1}"

if [ $# -gt 0 ]; then cas=("$@"); else cas=($(cd "$BANC/cas" && ls *.md | sed 's/\.md$//')); fi

ALLOWED=(
  Read Write Edit Glob Grep Agent Skill TodoWrite TaskStop KillShell BashOutput
  "Bash(npm *)" "Bash(npx *)" "Bash(node *)" "Bash(python *)" "Bash(python3 *)"
  "Bash(bash *)" "Bash(git *)" "Bash(ls *)" "Bash(mkdir *)" "Bash(cat *)" "Bash(curl *)"
  "Bash(cd *)" "Bash(kill *)" "Bash(sleep *)" "Bash(grep *)" "Bash(wc *)"
  "mcp__plugin_playwright_playwright__*"
)

lancer_cas() {
  local nom="$1" dossier="$SORTIE/$1"
  mkdir -p "$dossier"
  # Corps du cas sans l'en-tête YAML.
  local prompt
  prompt="$(awk 'BEGIN{n=0} /^---$/{n++; next} n>=2' "$BANC/cas/$nom.md" | sed '/./,$!d')"
  echo "▶ $nom"
  local debut=$SECONDS
  (
    cd "$dossier"
    claude -p "/workflow-ia:creer-site $prompt --auto" \
      --plugin-dir "$RACINE/plugins" \
      --permission-mode acceptEdits \
      --allowedTools "${ALLOWED[@]}" \
      ${MODELE:+--model "$MODELE"} \
      --output-format stream-json --verbose > run.jsonl 2> run.err || echo "code $?" >> run.err
  )
  echo $((SECONDS - debut)) > "$dossier/duree_s"
  echo "✔ $nom ($((SECONDS - debut)) s)"
}

mkdir -p "$SORTIE"
echo "Résultats : $SORTIE"
actifs=0
for nom in "${cas[@]}"; do
  [ -f "$BANC/cas/$nom.md" ] || { echo "Cas inconnu : $nom" >&2; continue; }
  lancer_cas "$nom" &
  actifs=$((actifs + 1))
  if [ "$actifs" -ge "$PARALLELE" ]; then wait -n; actifs=$((actifs - 1)); fi
done
wait

node "$BANC/rapport.mjs" "$SORTIE"
