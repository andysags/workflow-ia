// Tests du garde-fou de déploiement. Lancer : node --test plugins/workflow-ia/hooks/
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HOOK = join(dirname(fileURLToPath(import.meta.url)), "garde-deploiement.mjs");

function lancer(command, cwd) {
  const res = spawnSync("node", [HOOK], {
    input: JSON.stringify({ hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: { command }, cwd }),
    encoding: "utf8",
  });
  assert.equal(res.status, 0, res.stderr);
  return res.stdout ? JSON.parse(res.stdout).hookSpecificOutput : null;
}

// Arborescence semblable au banc d'essai : <racine>/sites/<slug>/{etat.json, 01-brief.md, site/dist/...}
function fabriquer() {
  const racine = mkdtempSync(join(tmpdir(), "garde-"));
  const projet = join(racine, "sites", "festival");
  const dist = join(projet, "site", "dist");
  mkdirSync(dist, { recursive: true });
  writeFileSync(join(projet, "etat.json"), "{}");
  writeFileSync(join(projet, "01-brief.md"), "# brief");
  writeFileSync(join(racine, "run.jsonl"), "{}");
  writeFileSync(join(dist, "index.html"), "<!doctype html>");
  return { racine, projet, dist };
}

test("reproduit l'incident du festival : deploy sans --dir depuis le dossier parent est refusé", () => {
  const { racine } = fabriquer();
  const r = lancer('npx --yes netlify-cli@latest deploy --build --message "Brouillon"', racine);
  assert.equal(r?.permissionDecision, "deny");
  assert.match(r.permissionDecisionReason, /sans `--dir`/);
});

test("deploy du dossier dist désigné explicitement : aucune décision (flux normal)", () => {
  const { racine, dist } = fabriquer();
  assert.equal(lancer(`npx netlify-cli deploy --dir ${dist} --site abc`, racine), null);
});

test("--dir relatif résolu après un cd : accepté", () => {
  const { racine, projet } = fabriquer();
  assert.equal(lancer(`cd ${projet}/site && npx netlify-cli deploy --dir=dist --prod --site abc`, racine), null);
});

test("cd dans le site puis deploy sans --dir : refusé", () => {
  const { racine, projet } = fabriquer();
  const r = lancer(`cd ${projet}/site && npx netlify-cli deploy --prod`, racine);
  assert.equal(r?.permissionDecision, "deny");
});

test("--dir vers le dossier projet (sans index.html) : refusé", () => {
  const { racine, projet } = fabriquer();
  const r = lancer(`npx netlify-cli deploy --dir ${projet}`, racine);
  assert.equal(r?.permissionDecision, "deny");
  assert.match(r.permissionDecisionReason, /index\.html/);
});

test("--dir contenant un livrable ou un .env : refusé", () => {
  const { racine, dist } = fabriquer();
  writeFileSync(join(dist, "04-contenu.md"), "x");
  assert.equal(lancer(`npx netlify-cli deploy --dir ${dist}`, racine)?.permissionDecision, "deny");
  const autre = fabriquer();
  writeFileSync(join(autre.dist, ".env"), "SECRET=1");
  assert.equal(lancer(`npx netlify-cli deploy --dir ${autre.dist}`, autre.racine)?.permissionDecision, "deny");
});

test("commandes sans rapport : aucune décision", () => {
  const { racine } = fabriquer();
  assert.equal(lancer("npm run build", racine), null);
  assert.equal(lancer("npx netlify-cli status", racine), null);
  assert.equal(lancer('git commit -m "deploy du site"', racine), null);
});

test("hors projet workflow-ia, deploy sans --dir : laissé au flux normal", () => {
  const ailleurs = mkdtempSync(join(tmpdir(), "autre-"));
  assert.equal(lancer("netlify deploy --prod", ailleurs), null);
});
