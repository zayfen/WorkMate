// create icons for macOS (.icns), Windows (.ico) and Linux (.png)
// Requirements:
// - Node.js (uses ESM)
// - png-to-ico (devDependency)
// - sharp (devDependency) to rasterize/resize; 将 SVG 渲染为 PNG
// - macOS: iconutil available in PATH for .icns generation

import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import url from 'node:url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const buildDir = join(projectRoot, 'build')
const linuxIconsDir = join(buildDir, 'icons')
const publicDir = join(projectRoot, 'public')

function ensureDir(dir) {
  try { mkdirSync(dir, { recursive: true }) } catch {}
}

ensureDir(buildDir)
ensureDir(linuxIconsDir)
ensureDir(publicDir)

async function ensureBasePng() {
  const basePng = join(buildDir, 'icon.png')
  if (existsSync(basePng)) return basePng
  // rasterize from public/icon.svg if present; otherwise, use built-in SVG
  const svgPath = join(publicDir, 'icon.svg')
  const svg = existsSync(svgPath) ? readFileSync(svgPath, 'utf8') : `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"256\" height=\"256\" viewBox=\"0 0 256 256\"><defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#4f46e5\"/><stop offset=\"100%\" stop-color=\"#06b6d4\"/></linearGradient></defs><rect x=\"0\" y=\"0\" width=\"256\" height=\"256\" rx=\"56\" fill=\"url(#g)\"/><g fill=\"#ffffff\"><path d=\"M56 178l24-100h22l26 62 26-62h22l24 100h-22l-15-68-29 68h-12l-29-68-15 68z\"/></g></svg>`
  const sharp = await dynamicSharp()
  const buf = await sharp(Buffer.from(svg)).resize(1024, 1024).png().toBuffer()
  writeFileSync(basePng, buf)
  return basePng
}

// removed stream helper; we write buffers directly

async function generateICO(basePng) {
  const toIco = (await import('png-to-ico')).default
  const sizes = [16, 24, 32, 48, 64, 128, 256]
  const sharp = await dynamicSharp()
  const buffers = []
  for (const s of sizes) {
    const buf = await sharp(basePng).resize(s, s).png().toBuffer()
    buffers.push(buf)
  }
  const icoBuffer = await toIco(buffers)
  writeFileSync(join(buildDir, 'icon.ico'), icoBuffer)
}

async function generateLinuxPngs(basePng) {
  const sharp = await dynamicSharp()
  const sizes = [512, 256, 128]
  for (const s of sizes) {
    const out = s === 512 ? join(linuxIconsDir, '512x512.png') : join(linuxIconsDir, `${s}x${s}.png`)
    const buf = await sharp(basePng).resize(s, s).png().toBuffer()
    writeFileSync(out, buf)
  }
}

async function generateIcns(basePng) {
  // prefer iconutil if available
  try {
    execSync('iconutil -h', { stdio: 'ignore' })
  } catch {
    // fallback: just write a 1024 png with icns extension as placeholder
    const sharp = await dynamicSharp()
    const buf = await sharp(basePng).resize(1024, 1024).png().toBuffer()
    writeFileSync(join(buildDir, 'icon.icns'), buf)
    return
  }
  const tmpIconset = join(buildDir, 'app.iconset')
  ensureDir(tmpIconset)
  const sharp = await dynamicSharp()
  const entries = [
    [16, 'icon_16x16'],
    [32, 'icon_16x16@2x'],
    [32, 'icon_32x32'],
    [64, 'icon_32x32@2x'],
    [128, 'icon_128x128'],
    [256, 'icon_128x128@2x'],
    [256, 'icon_256x256'],
    [512, 'icon_256x256@2x'],
    [512, 'icon_512x512'],
    [1024, 'icon_512x512@2x']
  ]
  for (const [size, name] of entries) {
    const pngPath = join(tmpIconset, `${name}.png`)
    const buf = await sharp(basePng).resize(size, size).png().toBuffer()
    writeFileSync(pngPath, buf)
  }
  execSync(`iconutil -c icns ${tmpIconset} -o ${join(buildDir, 'icon.icns')}`)
}

async function dynamicSharp() {
  try {
    const mod = await import('sharp')
    return mod.default
  } catch {
    throw new Error('需要安装可选依赖 sharp 以生成多尺寸图标: npm i -D sharp')
  }
}

async function ensureFaviconSvg() {
  const svgPath = join(publicDir, 'icon.svg')
  if (existsSync(svgPath)) return
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-label="WorkMate Icon">\n  <defs>\n    <linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#4f46e5\"/>\n      <stop offset=\"100%\" stop-color=\"#06b6d4\"/>\n    </linearGradient>\n  </defs>\n  <rect x=\"0\" y=\"0\" width=\"256\" height=\"256\" rx=\"56\" fill=\"url(#g)\"/>\n  <g fill=\"#ffffff\">\n    <path d=\"M56 178l24-100h22l26 62 26-62h22l24 100h-22l-15-68-29 68h-12l-29-68-15 68z\"/>\n  </g>\n</svg>\n`
  writeFileSync(svgPath, svg, 'utf8')
}

;(async () => {
  try {
    await ensureFaviconSvg()
    const base = await ensureBasePng()
    await Promise.all([
      generateICO(base),
      generateLinuxPngs(base),
      generateIcns(base)
    ])
    console.log('Icons generated in build/: icon.png, icon.ico, icon.icns, icons/512x512.png ...')
  } catch (e) {
    console.error(e?.message || e)
    process.exitCode = 1
  }
})()


