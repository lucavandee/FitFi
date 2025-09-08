#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
const warn=(m)=>console.warn(`⚠️  ${m}`), ok=(m)=>console.log(`✅ ${m}`);
if(process.version!=='v20.19.0'){warn(`Node 20.19.0 aanbevolen, gedetecteerd ${process.version}`)}
const must=["src/main.tsx","index.html","netlify/functions/nova.ts"];
must.forEach(p=>{if(!fs.existsSync(p)) warn(`Ontbrekend of verplaatst: ${p}`)});
let cnt=0; (function scan(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){
  if(["node_modules",".git","dist",".bolt"].includes(e.name)) continue;
  const p=path.join(d,e.name);
  if(e.isDirectory()) scan(p);
  else if(/\.(tsx?|jsx?|json|html|toml|md)$/.test(p)){
    const s=fs.readFileSync(p,"utf8");
    if(/\.\.\.(\s*[\n\r]|$)/g.test(s)){cnt++; warn(`Ellipses mogelijk afgebroken: ${p}`)}
}}})(".");
ok("Doctor klaar.");
