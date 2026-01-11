import https from 'https';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const FONTS_DIR = join(process.cwd(), 'public/assets/fonts');

const FONTS = [
  {
    name: 'Inter',
    url: 'https://fonts.gstatic.com/s/inter/v14/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hi2.woff2',
    filename: 'inter-regular.woff2'
  },
  {
    name: 'Inter',
    url: 'https://fonts.gstatic.com/s/inter/v14/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGfAZ9hjp-Ek-_0e3A.woff2',
    filename: 'inter-500.woff2'
  },
  {
    name: 'Inter',
    url: 'https://fonts.gstatic.com/s/inter/v14/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGfAZ9hjp-Ek-_0e3A.woff2',
    filename: 'inter-600.woff2'
  },
  {
    name: 'Inter',
    url: 'https://fonts.gstatic.com/s/inter/v14/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGfAZ9hjp-Ek-_0e3A.woff2',
    filename: 'inter-700.woff2'
  }
];

async function downloadFont(font: typeof FONTS[0]) {
  try {
    console.log(`Downloading ${font.name} (${font.filename})...`);
    const response = await new Promise<Buffer>((resolve, reject) => {
      https.get(font.url, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }).on('error', reject);
    });
    
    writeFileSync(join(FONTS_DIR, font.filename), response);
    console.log(`✓ Downloaded ${font.filename}`);
  } catch (error: any) {
    console.error(`✗ Failed to download ${font.filename}:`, error);
  }
}

async function main() {
  console.log('Creating fonts directory...');
  mkdirSync(FONTS_DIR, { recursive: true });
  console.log(`Downloading ${FONTS.length} fonts...`);
  for (const font of FONTS) {
    await downloadFont(font);
  }
  console.log('\n✓ All fonts downloaded successfully!');
  console.log(`Location: ${FONTS_DIR}`);
}

main().catch(console.error);
