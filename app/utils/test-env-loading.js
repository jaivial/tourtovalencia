// Test script to check environment variable loading
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const envPath = path.join(rootDir, '.env');

console.log('=== Environment Variable Loading Test ===');

// Method 1: Direct process.env access
console.log('\n1. Direct process.env access:');
console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID);
console.log('PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET);
console.log('Are identical:', process.env.PAYPAL_CLIENT_ID === process.env.PAYPAL_CLIENT_SECRET);

// Method 2: Load with dotenv
console.log('\n2. Loading with dotenv:');
const result = dotenv.config();
console.log('dotenv result:', result.error ? `Error: ${result.error.message}` : 'Success');
console.log('PAYPAL_CLIENT_ID after dotenv:', process.env.PAYPAL_CLIENT_ID);
console.log('PAYPAL_CLIENT_SECRET after dotenv:', process.env.PAYPAL_CLIENT_SECRET);
console.log('Are identical after dotenv:', process.env.PAYPAL_CLIENT_ID === process.env.PAYPAL_CLIENT_SECRET);

// Method 3: Read .env file directly
console.log('\n3. Reading .env file directly:');
try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        console.log('.env file content:');
        console.log(envContent);

        // Parse manually
        const lines = envContent.split('\n');
        const envVars = {};

        for (const line of lines) {
            if (line.trim() && !line.startsWith('#')) {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    let value = match[2].trim();

                    // Handle quoted values
                    if ((value.startsWith("'") && value.endsWith("'")) ||
                        (value.startsWith('"') && value.endsWith('"'))) {
                        value = value.substring(1, value.length - 1);
                    }

                    envVars[key] = value;
                }
            }
        }

        console.log('\nManually parsed values:');
        console.log('PAYPAL_CLIENT_ID:', envVars.PAYPAL_CLIENT_ID);
        console.log('PAYPAL_CLIENT_SECRET:', envVars.PAYPAL_CLIENT_SECRET);
        console.log('Are identical:', envVars.PAYPAL_CLIENT_ID === envVars.PAYPAL_CLIENT_SECRET);
    } else {
        console.log('.env file not found at:', envPath);
    }
} catch (error) {
    console.error('Error reading .env file:', error);
}

// Check for quotes in values
console.log('\n4. Checking for quotes in values:');
if (process.env.PAYPAL_CLIENT_ID) {
    console.log('PAYPAL_CLIENT_ID starts with quote:', process.env.PAYPAL_CLIENT_ID.startsWith("'") || process.env.PAYPAL_CLIENT_ID.startsWith('"'));
    console.log('PAYPAL_CLIENT_ID ends with quote:', process.env.PAYPAL_CLIENT_ID.endsWith("'") || process.env.PAYPAL_CLIENT_ID.endsWith('"'));
}

if (process.env.PAYPAL_CLIENT_SECRET) {
    console.log('PAYPAL_CLIENT_SECRET starts with quote:', process.env.PAYPAL_CLIENT_SECRET.startsWith("'") || process.env.PAYPAL_CLIENT_SECRET.startsWith('"'));
    console.log('PAYPAL_CLIENT_SECRET ends with quote:', process.env.PAYPAL_CLIENT_SECRET.endsWith("'") || process.env.PAYPAL_CLIENT_SECRET.endsWith('"'));
}

// Test with quotes removed
console.log('\n5. Testing with quotes removed:');
if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    const cleanId = process.env.PAYPAL_CLIENT_ID.replace(/^['"]|['"]$/g, '');
    const cleanSecret = process.env.PAYPAL_CLIENT_SECRET.replace(/^['"]|['"]$/g, '');

    console.log('Clean ID:', cleanId);
    console.log('Clean Secret:', cleanSecret);
    console.log('Clean values are identical:', cleanId === cleanSecret);
}
