// Fixture sans dépendance : copie src/ dans dist/.
import { cpSync, rmSync } from "node:fs";
rmSync("dist", { recursive: true, force: true });
cpSync("src", "dist", { recursive: true });
console.log("build OK : dist/");
