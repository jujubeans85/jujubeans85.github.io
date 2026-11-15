#!/usr/bin/env python3
"""Render CLUB 2263's self-contained vector invitation and social images.

Photo transformations were made with imagegen; this script only embeds and
formats that finished artwork, outlines typography, and rasterizes the SVG.
Requires fontTools, Pillow and Node sharp. Override FONT_SERIF / FONT_ITALIC /
FONT_SANS where the system's font paths differ.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from PIL import Image
from io import BytesIO
import os, base64, json, subprocess

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT
URL = 'https://jujubeans85.github.io/club-2263/'
FONTS = {
    'serif': os.environ.get('FONT_SERIF', '/usr/share/fonts/opentype/urw-base35/NimbusRoman-Regular.otf'),
    'italic': os.environ.get('FONT_ITALIC', '/usr/share/fonts/opentype/urw-base35/NimbusRoman-Italic.otf'),
    'sans': os.environ.get('FONT_SANS', '/usr/share/fonts/truetype/open-sans/OpenSans-Regular.ttf'),
}
fonts = {key: TTFont(path) for key, path in FONTS.items()}

def typepath(text, x, y, size, face='serif', fill='#f3eadb', tracking=0, anchor='middle'):
    """Outline text so the invite renders consistently without remote fonts."""
    font = fonts[face]
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    units = font['head'].unitsPerEm
    scale = size / units
    glyph_names = [cmap.get(ord(c), '.notdef') for c in text]
    advances = [glyphs[n].width * scale for n in glyph_names]
    width = sum(advances) + max(0, len(text)-1) * tracking
    start = x - width/2 if anchor == 'middle' else x
    paths=[]
    for name, advance in zip(glyph_names, advances):
        pen=SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        path=pen.getCommands()
        if path:
            paths.append(f'<path d="{path}" transform="translate({start:.4f} {y}) scale({scale:.7f} {-scale:.7f})"/>')
        start += advance + tracking
    return f'<g fill="{fill}" aria-label="{text}">' + ''.join(paths) + '</g>'

buf=BytesIO()
Image.open(PUBLIC/'assets/lamp.webp').convert('RGB').save(buf,format='JPEG',quality=92,optimize=True)
photo='data:image/jpeg;base64,'+base64.b64encode(buf.getvalue()).decode()

def root(w,h,title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>{title}</title><desc>CLUB 2263. After dark. The night has a private side. Midnight, Monday 16 November 2026, AEDT. Adults 18 and over. By private invitation. Not to be missed.</desc>'

poster = [root(1080,1600,'CLUB 2263 — A private midnight invitation')]
poster += ['''<defs>
  <radialGradient id="glow"><stop stop-color="#3a0c14"/><stop offset="1" stop-color="#0a0708"/></radialGradient>
  <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0708" stop-opacity="0"/><stop offset=".44" stop-color="#0a0708" stop-opacity=".1"/><stop offset="1" stop-color="#0a0708" stop-opacity=".92"/></linearGradient>
  <clipPath id="arch"><path d="M300 1080V675a240 240 0 0 1 480 0v405Z"/></clipPath>
</defs>
<rect width="1080" height="1600" fill="url(#glow)"/>
<rect x="34" y="34" width="1012" height="1532" rx="1" fill="none" stroke="#796244" stroke-opacity=".62"/>
<path d="M70 112H275M805 112H1010" stroke="#8a7051" stroke-width="1"/>
<path d="M529 110l11-11 11 11-11 11Z" fill="#a88a5e"/>
''']
poster.append(typepath('A  P R I V A T E  I N V I T A T I O N',540,162,17,'sans',fill='#b89f7f'))
poster.append(typepath('CLUB',540,250,70,'serif',tracking=18))
poster.append(typepath('2263',540,437,223,'serif',tracking=5))
poster.append(f'<image x="300" y="435" width="480" height="645" preserveAspectRatio="xMidYMid slice" xlink:href="{photo}" clip-path="url(#arch)"/>')
poster.append('<path d="M300 1080V675a240 240 0 0 1 480 0v405Z" fill="url(#shade)"/><path d="M288 1092V675a252 252 0 0 1 504 0v417" fill="none" stroke="#ab885b" stroke-opacity=".56"/>')
poster.append(typepath('AFTER DARK',540,513,23,'sans',tracking=8,fill='#d3b58d'))
poster.append(typepath('The night has',540,825,72,'serif'))
poster.append(typepath('a private side.',540,924,105,'italic'))
poster.append('<path d="M475 1064H605" stroke="#a88a5e"/>')
poster.append(typepath('MIDNIGHT',540,1181,67,'serif',tracking=8))
poster.append(typepath('MONDAY 16 NOVEMBER 2026 · AEDT',540,1240,23,'sans',tracking=1.6,fill='#cab9a4'))
poster.append(typepath('18+ · BY PRIVATE INVITATION',540,1345,21,'sans',tracking=3,fill='#bda787'))
poster.append('<path d="M140 1394H940" stroke="#796244" stroke-opacity=".65"/>')
poster.append(typepath('NOT TO BE MISSED',540,1458,23,'sans',tracking=5,fill='#f3eadb'))
poster.append(f'<a xlink:href="{URL}" target="_blank">'+typepath('jujubeans85.github.io/club-2263',540,1520,19,'sans',fill='#bda787')+'</a>')
poster.append('</svg>')
poster=''.join(poster)
(PUBLIC/'invite.svg').write_text(poster)

og=[root(1200,630,'CLUB 2263 — After Dark')]
og += ['''<defs><linearGradient id="background"><stop stop-color="#0a0708"/><stop offset="1" stop-color="#2c0911"/></linearGradient><clipPath id="ogarch"><path d="M818 590V225a155 155 0 0 1 310 0v365Z"/></clipPath><linearGradient id="ogshade" x1="0" y1="0" x2="0" y2="1"><stop offset=".4" stop-color="#0a0708" stop-opacity="0"/><stop offset="1" stop-color="#0a0708" stop-opacity=".75"/></linearGradient></defs><rect width="1200" height="630" fill="url(#background)"/><rect x="24" y="24" width="1152" height="582" fill="none" stroke="#796244" stroke-opacity=".65"/>''']
og.append(f'<image x="818" y="70" width="310" height="520" preserveAspectRatio="xMidYMid slice" xlink:href="{photo}" clip-path="url(#ogarch)"/>')
og.append('<path d="M818 590V225a155 155 0 0 1 310 0v365Z" fill="url(#ogshade)"/><path d="M810 590V225a163 163 0 0 1 326 0v365" fill="none" stroke="#a88a5e" stroke-opacity=".6"/>')
og.append(typepath('AFTER DARK',78,87,20,'sans',tracking=7,fill='#c1a67e',anchor='start'))
og.append(typepath('CLUB',72,167,51,'serif',tracking=10,anchor='start'))
og.append(typepath('2263',68,317,178,'serif',tracking=2,anchor='start'))
og.append(typepath('The night has a private side.',76,386,47,'italic',anchor='start'))
og.append('<path d="M78 420H729" stroke="#796244"/>')
og.append(typepath('MIDNIGHT',78,475,36,'serif',tracking=4,anchor='start'))
og.append(typepath('MONDAY 16 NOVEMBER 2026 · AEDT',78,515,20,'sans',tracking=.5,fill='#cab9a4',anchor='start'))
og.append(typepath('18+ · BY PRIVATE INVITATION',78,567,17,'sans',tracking=2,fill='#bda787',anchor='start'))
og.append(typepath('NOT TO BE MISSED',970,575,12,'sans',tracking=1.6,fill='#e4cfb1'))
og.append('</svg>')
og=''.join(og)
temporary=ROOT/'tools/.og-render.svg'
temporary.write_text(og)

(PUBLIC/'favicon.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>CLUB 2263</title><rect width="64" height="64" rx="13" fill="#10080b"/><path d="M14 51V28a18 18 0 0 1 36 0v23" fill="#360d17" stroke="#b29870" stroke-width="2"/><circle cx="32" cy="28" r="7" fill="#e5d7bd"/><path d="M29 32h6l5 18H24Z" fill="#e5d7bd"/></svg>''')

node=os.environ.get('CODEX_PRIMARY_RUNTIME_NODE','node')
modules=os.environ.get('CODEX_PRIMARY_RUNTIME_NODE_MODULES',str(ROOT/'node_modules'))
script='''const sharp=require(process.argv[1]+'/sharp'); const fs=require('fs'); Promise.all([[process.argv[2],process.argv[3]],[process.argv[4],process.argv[5]]].map(async ([src,dst])=>{await sharp(fs.readFileSync(src),{density:72}).png({compressionLevel:9}).toFile(dst);})).catch(e=>{console.error(e);process.exit(1)});'''
subprocess.run([node,'-e',script,modules,str(PUBLIC/'invite.svg'),str(PUBLIC/'invite.png'),str(temporary),str(PUBLIC/'og-image.png')],check=True)
temporary.unlink()
for name in ('invite.svg','invite.png','og-image.png','favicon.svg'):
    file=PUBLIC/name
    print(f'{file}: {file.stat().st_size:,} bytes')
