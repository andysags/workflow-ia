#!/usr/bin/env bash
# Vérifie les outils nécessaires à workflow-ia. Lecture seule : n'installe rien.
# Sortie : une ligne par outil, puis "PREREQUIS: OK" ou "PREREQUIS: MANQUANT <liste>".

manquants=()

verifier() { # nom, commande de version, obligatoire (1/0), conseil
  local nom="$1" cmd="$2" obligatoire="$3" conseil="$4" version
  if version=$(eval "$cmd" 2>/dev/null | head -n 1) && [ -n "$version" ]; then
    printf 'OK        %-14s %s\n' "$nom" "$version"
  elif [ "$obligatoire" = 1 ]; then
    printf 'MANQUANT  %-14s %s\n' "$nom" "$conseil"
    manquants+=("$nom")
  else
    printf 'OPTIONNEL %-14s %s\n' "$nom" "$conseil"
  fi
}

verifier "node"    "node --version"    1 "Node.js 20 ou plus : https://nodejs.org"
verifier "npm"     "npm --version"     1 "installé avec Node.js"
verifier "git"     "git --version"     1 "https://git-scm.com"
verifier "python3" "python3 --version" 1 "Python 3 : https://www.python.org (utilisé par les skills de design)"
verifier "gh"      "gh --version"      0 "CLI GitHub, pour créer le repo du site : https://cli.github.com"

if command -v node >/dev/null 2>&1; then
  majeure=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null)
  if [ -n "$majeure" ] && [ "$majeure" -lt 20 ]; then
    printf 'MANQUANT  %-14s %s\n' "node>=20" "version $majeure trop ancienne"
    manquants+=("node>=20")
  fi
fi

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    printf 'OK        %-14s %s\n' "gh auth" "connecté"
  else
    printf 'OPTIONNEL %-14s %s\n' "gh auth" "lancer 'gh auth login' pour pousser le site sur GitHub"
  fi
fi

if [ -n "${NETLIFY_AUTH_TOKEN:-}" ]; then
  printf 'OK        %-14s %s\n' "Netlify" "NETLIFY_AUTH_TOKEN défini"
else
  printf 'OPTIONNEL %-14s %s\n' "Netlify" "NETLIFY_AUTH_TOKEN absent : le site restera en local jusqu'à sa définition"
fi

if [ ${#manquants[@]} -eq 0 ]; then
  echo "PREREQUIS: OK"
else
  echo "PREREQUIS: MANQUANT ${manquants[*]}"
fi
