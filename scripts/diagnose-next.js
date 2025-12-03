#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const pkg = require('../package.json')

function ok(msg){ console.log('\x1b[32m[OK]\x1b[0m', msg) }
function err(msg){ console.log('\x1b[31m[ERR]\x1b[0m', msg) }
function info(msg){ console.log('\x1b[36m[INFO]\x1b[0m', msg) }

console.log('\n==== Next.js Diagnostic Script ====\n')
info('Environment')
console.log(' Node:', process.version)
console.log(' npm / yarn script name:', pkg.scripts && Object.keys(pkg.scripts).length ? Object.keys(pkg.scripts).join(', ') : 'none')

// check package.json type
if (pkg.type && pkg.type === 'module') {
  err('package.json contains "type": "module" — this may cause require()/CommonJS issues')
} else {
  ok('package.json has no "type": "module"')
}

// check next.config.cjs
const nextConfigPath = path.join(__dirname, '..', 'next.config.cjs')
if (fs.existsSync(nextConfigPath)){
  const cfg = fs.readFileSync(nextConfigPath,'utf8')
  ok('Found next.config.cjs')
  // look for storage.googleapis.com
  if (/storage\.googleapis\.com/.test(cfg) || /storage\.googleapis\.com/.test(cfg)){
    ok('next.config.cjs references storage.googleapis.com')
  } else {
    err('next.config.cjs does NOT reference storage.googleapis.com')
  }
  // images.domains check
  if (/images:\s*\{[\s\S]*domains:\s*\[([\s\S]*?)\]/m.test(cfg)){
    ok('images.domains is configured in next.config.cjs')
  } else if (/remotePatterns:\s*\[([\s\S]*?)\]/m.test(cfg)){
    ok('images.remotePatterns is configured in next.config.cjs')
  } else {
    err('No images.domains or remotePatterns found in next.config.cjs')
  }
} else {
  err('next.config.cjs not found at ' + nextConfigPath)
}

// search for require() occurrences in .next server files next to import/export
const nextDir = path.join(__dirname, '..', '.next')
function walk(dir){
  let results = []
  if (!fs.existsSync(dir)) return results
  const list = fs.readdirSync(dir)
  list.forEach(file=>{
    const fp = path.join(dir,file)
    const stat = fs.statSync(fp)
    if (stat && stat.isDirectory()) results = results.concat(walk(fp))
    else results.push(fp)
  })
  return results
}

const files = walk(nextDir).filter(f=>f.endsWith('.js'))
let suspect = []
files.forEach(f=>{
  const txt = fs.readFileSync(f,'utf8')
  if (txt.includes('require(') && (txt.includes('export') || txt.includes('import '))){
    suspect.push(f)
  }
})

if (suspect.length){
  err('Found server-compiled JS files that mix require() with ES module syntax (possible cause of "require is not defined"):')
  suspect.slice(0,10).forEach(s=>console.log(' -', s))
  if (suspect.length>10) console.log(' ...', suspect.length - 10, 'more')
} else {
  ok('No obvious .next files mixing require() with ES module syntax')
}

// quick check for next/image config values printed
try{
  // Attempt to require next config from the built file if available
  const confText = fs.readFileSync(nextConfigPath,'utf8')
  const domainsMatch = confText.match(/domains:\s*\[([\s\S]*?)\]/m)
  if (domainsMatch){
    const domains = domainsMatch[1].split(/[,\n]/).map(s=>s.replace(/[\[\]'"\s]/g,'')).filter(Boolean)
    info('Configured images.domains: ' + domains.join(', '))
  }
}catch(e){ }

console.log('\n==== End of diagnostic ====' )
console.log('Run: node scripts/diagnose-next.js')
