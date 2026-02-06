#!/usr/bin/env python3
"""Update all image references to R2 URLs"""

import re
import os

R2_BASE = "https://pub-b33f26330e8542cbbcca76ef18d29dd0.r2.dev/tourtovalencia/public"

def replace_in_file(filepath):
    """Replace image references in a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Replace photo patterns
        content = re.sub(r'"/photo(\d+IS\d+)\.webp"', rf'"{R2_BASE}/photo\1.webp"', content)
        content = re.sub(r'"/photo(\d+section\d+)\.jpg"', rf'"{R2_BASE}/photo\1.jpg"', content)
        content = re.sub(r'"/photo(\d+)IS(\d+)\.webp"', rf'"{R2_BASE}/photo\1IS\2.webp"', content)
        
        # Replace olgaphoto patterns
        content = re.sub(r'"/olgaphoto(\d+)\.jpeg"', rf'"{R2_BASE}/olgaphoto\1.jpeg"', content)
        
        # Replace airbnb patterns
        content = re.sub(r'"/airbnb2?\.jpeg"', rf'"{R2_BASE}/airbnb.jpeg"', content)
        content = re.sub(r'"/airbnb\.jpeg"', rf'"{R2_BASE}/airbnb.jpeg"', content)
        
        # Replace hero patterns
        content = re.sub(r'"/hero(\d+)\.webp"', rf'"{R2_BASE}/hero\1.webp"', content)
        content = re.sub(r'"/hero(\d+)\.jpg"', rf'"{R2_BASE}/hero\1.jpg"', content)
        
        # Replace tourtovalencia patterns
        content = re.sub(r'https://tourtovalencia\.com/(tourtovalenciablackbg\.webp)', rf'{R2_BASE}/\1', content)
        content = re.sub(r'/tourtovalenciablackbg\.webp', rf'{R2_BASE}/tourtovalenciablackbg.webp', content)
        
        # Replace favicon patterns
        content = re.sub(r'"/favicon(-192|-512)?\.png"', rf'"{R2_BASE}/favicon\1.png"', content)
        content = re.sub(r'"/apple-touch-icon(-precomposed)?\.png"', rf'"{R2_BASE}/apple-touch-icon.png"', content)
        
        # Replace logo patterns
        content = re.sub(r'/images/(logonuevolog\w+\.png)', rf'{R2_BASE}/\1', content)
        content = re.sub(r'"/logo(-dark|-light)?\.png"', rf'"{R2_BASE}/logo\1.png"', content)
        
        # Replace index section images
        content = re.sub(r'"/photo1IndexSection2\.webp"', rf'"{R2_BASE}/photo1IndexSection2.webp"', content)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {filepath}")
            return True
        return False
    except Exception as e:
        print(f"Error: {filepath} - {e}")
        return False

# Files to update
files = [
    "app/data/data.ts",
    "app/data/data.json",
    "app/data/carouseldata.ts",
    "app/routes/_index.tsx",
    "app/routes/legal.tsx",
    "app/routes/valencia-things-to-do.tsx",
    "app/routes/book.tsx",
    "app/routes/index.tsx",
    "app/routes/admin.dashboard.pagegen.hooks.ts",
    "app/components/_index/IndexSection1.tsx",
    "app/components/_index/HeroSection.tsx",
    "app/components/_sanjuan/SanJuanSection3Dynamic.tsx",
    "app/components/_sanjuan/SanJuanSection2.hooks.ts",
    "app/root.tsx",
]

os.chdir("/var/www/tourtovalencia")
updated = 0
for f in files:
    if os.path.exists(f):
        if replace_in_file(f):
            updated += 1

print(f"\n{updated} files updated!")
