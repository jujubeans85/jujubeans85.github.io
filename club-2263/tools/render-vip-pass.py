#!/usr/bin/env python3
"""Author precise VIP preview typography over the existing approved photograph."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from html import escape
from PIL import Image
from io import BytesIO
import base64, os, subprocess

PUBLIC=Path(__file__).resolve().parents[1]
OUT=PUBLIC/'live'
FONTS={
 'serif':TTFont('/usr/share/fonts/opentype/urw-base35/NimbusRoman-Regular.otf'),
 'italic':TTFont('/usr/share/fonts/opentype/urw-base35/NimbusRoman-Italic.otf'),
 'sans':TTFont('/usr/share/fonts/truetype/open-sans/OpenSans-Regular.ttf'),
}
def lettering(text,x,y,size,face='serif',fill='#eee8df',tracking=0):
 f=FONTS[face];glyphs=f.getGlyphSet();cmap=f.getBestCmap();scale=size/f['head'].unitsPerEm
 result=[]
 for c in text:
  glyph=glyphs[cmap.get(ord(c),'.notdef')];pen=SVGPathPen(glyphs);glyph.draw(pen)
  if pen.getCommands(): result.append(f'<path d="{pen.getCommands()}" transform="translate({x:.3f} {y}) scale({scale:.7f} {-scale:.7f})"/>')
  x+=glyph.width*scale+tracking
 return f'<g fill="{fill}" aria-label="{escape(text,quote=True)}">'+''.join(result)+'</g>'
photo_buffer=BytesIO()
Image.open(PUBLIC/'assets/lamp.webp').convert('RGB').save(photo_buffer,format='JPEG',quality=92,optimize=True)
photo='data:image/jpeg;base64,'+base64.b64encode(photo_buffer.getvalue()).decode()
parts=['''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img"><title>JUiCE has gifted you a platinum VIP pass</title><desc>CLUB 2263. Late entry and special attention on arrival. Doors close strictly at 02:00 AEDT, Monday 16 November 2026. Adults 18+.</desc><defs>
<linearGradient id="night" x1="0" x2="1" y2="1"><stop stop-color="#09080b"/><stop offset=".48" stop-color="#270b17"/><stop offset="1" stop-color="#08090d"/></linearGradient>
<linearGradient id="platinum" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#e7e4df"/><stop offset=".3" stop-color="#a5a4b0"/><stop offset=".46" stop-color="#f9f4ed"/><stop offset=".63" stop-color="#bebfc9"/><stop offset="1" stop-color="#ded8cf"/></linearGradient>
<radialGradient id="ember"><stop stop-color="#791b36" stop-opacity=".35"/><stop offset="1" stop-color="#791b36" stop-opacity="0"/></radialGradient>
<clipPath id="arch"><path d="M879 524V213a112 112 0 0 1 224 0v311Z"/></clipPath>
<linearGradient id="photoShade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#12090e" stop-opacity=".1"/><stop offset="1" stop-color="#12090e" stop-opacity=".9"/></linearGradient>
</defs><rect width="1200" height="630" fill="url(#night)"/><ellipse cx="550" cy="350" rx="630" ry="460" fill="url(#ember)"/>
<rect x="25" y="25" width="1150" height="580" rx="22" fill="none" stroke="url(#platinum)" stroke-opacity=".5"/><rect x="36" y="36" width="1128" height="558" rx="14" fill="none" stroke="#d8c6b4" stroke-opacity=".1"/>
<path d="M810 90V540" stroke="#a9a2ac" stroke-opacity=".3"/>
''']
parts.append(f'<image href="{photo}" x="879" y="100" width="224" height="424" preserveAspectRatio="xMidYMid slice" clip-path="url(#arch)"/>')
parts.append('<path d="M879 524V213a112 112 0 0 1 224 0v311Z" fill="url(#photoShade)"/><path d="M869 525V213a122 122 0 0 1 244 0v312" fill="none" stroke="#c5b5a9" stroke-opacity=".45"/>')
parts.append(lettering('JUiCE HAS GIFTED YOU',76,104,21,'sans',tracking=4.2))
parts.append(lettering('PLATINUM',70,230,76,fill='url(#platinum)',tracking=4))
parts.append(lettering('VIP PASS',68,343,116,fill='url(#platinum)',tracking=2))
parts.append('<path d="M78 382H734" stroke="#bbb1b3" stroke-opacity=".45"/>')
parts.append(lettering('Late entry.',78,426,34,'italic'))
parts.append(lettering('Special attention on arrival.',78,468,34,'italic'))
parts.append(lettering('DOORS CLOSE STRICTLY @ 02:00',78,541,21,'sans',tracking=1.5))
parts.append(lettering('16 NOVEMBER 2026  /  AEDT  /  18+',78,571,12,'sans',fill='#ad9c9f',tracking=1.7))
parts.append(lettering('CLUB',922,432,25,'serif',tracking=9))
parts.append(lettering('2263',899,499,74,'serif',tracking=1))
parts.append('<path d="M980 555l11-16 11 16-11 16Z" fill="none" stroke="url(#platinum)"/>')
parts.append('</svg>')
svg=OUT/'vip-preview.svg';svg.write_text(''.join(parts))
node=os.environ.get('CODEX_PRIMARY_RUNTIME_NODE','node')
mods=os.environ.get('CODEX_PRIMARY_RUNTIME_NODE_MODULES',str(PUBLIC/'node_modules'))
script="const sharp=require(process.argv[1]+'/sharp'); sharp(process.argv[2],{density:72}).png({compressionLevel:9}).toFile(process.argv[3]).catch(e=>{console.error(e);process.exit(1)});"
subprocess.run([node,'-e',script,mods,str(svg),str(OUT/'vip-preview.png')],check=True)
print(f'VIP preview exported: {svg.stat().st_size} SVG bytes, {(OUT/"vip-preview.png").stat().st_size} PNG bytes')
