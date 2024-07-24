#! /usr/bin/env node
import { execSync } from "child_process";
import { writeFileSync } from "fs";

console.log("Building...");
console.log(execSync("yarn vite build --emptyOutDir").toString());

console.log("Writing git hash file...");
const current_hash = JSON.stringify(execSync("git rev-parse HEAD").toString().trim());
writeFileSync("./dist/hash.json", `{"hash": ${current_hash}}`);
