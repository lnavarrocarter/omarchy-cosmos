// Loads a QML ".pragma library" JS file in Node, resolving its ".import"s.
const fs = require("node:fs")
const path = require("node:path")

const cache = new Map()

function load(file) {
  file = path.resolve(file)
  if (cache.has(file)) return cache.get(file)
  let src = fs.readFileSync(file, "utf8").replace(/^\.pragma library\s*/, "")
  const names = [], mods = []
  src = src.replace(/^\.import\s+"([^"]+)"\s+as\s+(\w+)\s*$/gm, (_, rel, name) => {
    names.push(name)
    mods.push(load(path.join(path.dirname(file), rel)))
    return ""
  })
  const mod = { exports: {} }
  new Function("module", ...names, src)(mod, ...mods)
  cache.set(file, mod.exports)
  return mod.exports
}

module.exports = { load, root: path.join(__dirname, "..") }
