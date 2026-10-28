// Tests hors ligne des scripts : node --test plugins/workflow-ia/skills/creer-site/scripts/tests/scripts.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ici = dirname(fileURLToPath(import.meta.url));
const script = (nom) => join(ici, "..", nom);
const lancer = (nom, args, env = {}) => execFileSync("node", [script(nom), ...args], { encoding: "utf8", env: { ...process.env, ...env } });

test("photos-libres : garde CC BY-SA et domaine public, écarte NC et les petites photos", () => {
  const d = mkdtempSync(join(tmpdir(), "pl-"));
  const sortie = lancer("photos-libres.mjs", ["akassa", d, "--depuis", join(ici, "commons-akassa.json"), "--sans-telechargement"]);
  assert.match(sortie, /PHOTOS: 2 candidates/);
  const l = JSON.parse(readFileSync(join(d, "LICENCES.json"), "utf8"));
  assert.deepEqual(l.photos.map((p) => p.licence), ["CC BY-SA 4.0", "Public domain"]);
  assert.equal(l.photos[0].auteur, "Adoscam");
  assert.equal(l.photos[0].attribution_requise, true);
  assert.equal(l.photos[1].attribution_requise, false);
  assert.ok(l.ecartees.some((e) => /CC BY-NC/.test(e)));
  assert.ok(l.ecartees.some((e) => /trop petite/.test(e)));
});

for (const [domaine, principal, alias, ligne] of [
  ["chezmamaafi.bj", "chezmamaafi.bj", ["www.chezmamaafi.bj"], /\| www \| CNAME/],
  ["https://WWW.Exemple.CI/", "www.exemple.ci", ["exemple.ci"], /apex-loadbalancer\.netlify\.com/],
  ["boutique.vintage.bj", "boutique.vintage.bj", [], /\| boutique \| CNAME/],
  ["ateliers.com.sn", "ateliers.com.sn", ["www.ateliers.com.sn"], /\| www \| CNAME/],
]) {
  test(`domaine (simulation) : ${domaine}`, () => {
    const sortie = lancer("domaine.mjs", ["--site", "abc", "--domaine", domaine, "--simulation"]);
    const corps = JSON.parse(sortie.match(/updateSite (\{.*\})/)[1]).body;
    assert.equal(corps.custom_domain, principal);
    assert.deepEqual(corps.domain_aliases, alias);
    assert.match(sortie, ligne);
    assert.match(sortie, /DOMAINE: EN_ATTENTE_DNS simulation/);
  });
}

test("domaine : refuse un nom invalide", () => {
  assert.match(lancer("domaine.mjs", ["--site", "abc", "--domaine", "pas un domaine", "--simulation"]), /DOMAINE: EN_ATTENTE .*pas un nom de domaine valide/);
});
