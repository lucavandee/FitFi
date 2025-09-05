const fs = require("fs");
const { execSync } = require("child_process");

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const has = (pkg.dependencies && pkg.dependencies.clsx) || (pkg.devDependencies && pkg.devDependencies.clsx);

if (has) {
  console.log("✅ clsx aanwezig:", has);
} else {
  console.log("ℹ Installeer clsx@2 …");
  execSync("npm i -E clsx@2", { stdio: "inherit" });
  console.log("✅ clsx geïnstalleerd.");
}