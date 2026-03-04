// Deploy script for Bunny CDN using FTP
// Usage: npx tsx scripts/deploy-bunny.ts
import * as ftp from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const STORAGE_ZONE = 'tourtovalencia';
const API_KEY = process.env.BUNNY_STORAGE_API_KEY || process.env.BUNNY_API_KEY || '';
const FTP_HOST = 'storage.bunnycdn.com';
const CDN_URL = 'https://cdn.tourtovalencia.com';

const BUILD_DIR = path.join(__dirname, '../build/client');
const ASSETS_DIR = path.join(BUILD_DIR, 'assets');

const IGNORE_PATTERNS = ['.DS_Store', '.gitkeep', 'manifest.json'];

async function deploy() {
  console.log('🚀 Bunny CDN Deployment (FTP)\n');

  if (!API_KEY) {
    console.error('❌ Missing Bunny API key. Set BUNNY_STORAGE_API_KEY or BUNNY_API_KEY.');
    process.exit(1);
  }

  if (!fs.existsSync(BUILD_DIR)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  const client = new ftp.Client();

  try {
    console.log('🔌 Connecting to Bunny CDN...');
    await client.access({
      host: FTP_HOST,
      user: STORAGE_ZONE,
      password: API_KEY,
      secure: true,
    });
    console.log('✅ Connected!\n');

    let totalUploaded = 0;
    let totalFailed = 0;

    // Upload root files
    console.log('📤 Uploading root files...');
    const rootFiles = fs.readdirSync(BUILD_DIR).filter(
      f => !IGNORE_PATTERNS.includes(f) && !f.startsWith('.') && fs.statSync(path.join(BUILD_DIR, f)).isFile()
    );

    for (const file of rootFiles) {
      try {
        await client.uploadFrom(path.join(BUILD_DIR, file), '/' + file);
        console.log(`  ✓ ${file}`);
        totalUploaded++;
      } catch (err) {
        console.log(`  ✗ ${file}: ${err}`);
        totalFailed++;
      }
    }

    // Upload assets recursively
    console.log('\n📤 Uploading assets recursively...');
    await uploadAll(client, ASSETS_DIR, '/', (success: boolean) => {
      if (success) {
        totalUploaded++;
      } else {
        totalFailed++;
      }
    });

    console.log('\n✅ Deployment Complete!');
    console.log(`   Uploaded: ${totalUploaded} files`);
    console.log(`   Failed: ${totalFailed} files`);
    console.log(`\n🌐 CDN URLs:`);
    console.log(`   Root: ${CDN_URL}/`);
    console.log(`   Assets: ${CDN_URL}/assets/`);

    if (totalFailed > 0) {
      console.log('\n⚠️  Some files failed to upload.');
    }
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  } finally {
    client.close();
  }
}

async function uploadAll(
  client: ftp.Client,
  dir: string,
  remoteDir: string,
  logFn: (success: boolean) => void
) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (IGNORE_PATTERNS.includes(file)) continue;

    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const remotePath = remoteDir + file;

    if (stat.isDirectory()) {
      await uploadAll(client, filePath, remotePath + '/', logFn);
    } else {
      try {
        await client.uploadFrom(filePath, remotePath);
        console.log(`  ✓ ${file}`);
        logFn(true);
      } catch (err) {
        console.log(`  ✗ ${file}: ${err}`);
        logFn(false);
      }
    }
  }
}

deploy();
