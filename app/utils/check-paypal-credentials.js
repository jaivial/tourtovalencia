// Script to check if PayPal credentials are properly configured
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

console.log('Checking PayPal credentials...');

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('PayPal API Base:', process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.paypal.com');

// More detailed credential checks
console.log('\n=== Credential Details ===');

if (!clientId) {
    console.error('❌ PAYPAL_CLIENT_ID is missing in environment variables');
} else {
    console.log('✅ PAYPAL_CLIENT_ID is set');
    console.log('   Length:', clientId.length);
    console.log('   First 4 chars:', clientId.substring(0, 4));
    console.log('   Last 4 chars:', clientId.substring(clientId.length - 4));
    console.log('   Full value (for debugging):', clientId);
}

if (!clientSecret) {
    console.error('❌ PAYPAL_CLIENT_SECRET is missing in environment variables');
} else {
    console.log('✅ PAYPAL_CLIENT_SECRET is set');
    console.log('   Length:', clientSecret.length);
    console.log('   First 4 chars:', clientSecret.substring(0, 4));
    console.log('   Last 4 chars:', clientSecret.substring(clientSecret.length - 4));
    console.log('   Full value (for debugging):', clientSecret);
}

// Check if they are identical
if (clientId && clientSecret) {
    if (clientId === clientSecret) {
        console.error('❌ WARNING: Client ID and Client Secret are identical!');

        // Check for whitespace issues
        const trimmedId = clientId.trim();
        const trimmedSecret = clientSecret.trim();

        if (trimmedId !== clientId || trimmedSecret !== clientSecret) {
            console.log('   Possible whitespace issue detected!');
            console.log('   Trimmed ID length:', trimmedId.length);
            console.log('   Trimmed Secret length:', trimmedSecret.length);
        }

        // Check character by character
        console.log('   Character comparison:');
        let differences = 0;
        for (let i = 0; i < Math.max(clientId.length, clientSecret.length); i++) {
            if (clientId[i] !== clientSecret[i]) {
                console.log(`   Position ${i}: ID='${clientId[i] || ''}' vs Secret='${clientSecret[i] || ''}'`);
                differences++;
                if (differences >= 5) {
                    console.log('   ... more differences found (showing only first 5)');
                    break;
                }
            }
        }

        if (differences === 0) {
            console.log('   No character differences found - they are truly identical');
        }
    } else {
        console.log('✅ Client ID and Client Secret are different (as expected)');
    }
}

// Test authentication if both credentials are present
if (clientId && clientSecret) {
    console.log('\nTesting PayPal authentication...');

    const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.paypal.com';

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    console.log('Auth string first 10 chars:', auth.substring(0, 10) + '...');

    fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`
        },
        body: 'grant_type=client_credentials'
    })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response status text:', response.statusText);
            return response.text();
        })
        .then(text => {
            try {
                const data = JSON.parse(text);
                console.log('Response data:', data);

                if (data.access_token) {
                    console.log('✅ Successfully authenticated with PayPal!');
                } else {
                    console.error('❌ Authentication failed - no access token in response');
                }
            } catch (e) {
                console.error('❌ Failed to parse response as JSON:', text);
            }
        })
        .catch(error => {
            console.error('❌ Error testing PayPal authentication:', error.message);
        });
} else {
    console.log('\n❌ Cannot test authentication - missing credentials');
}

// Check .env file directly
try {
    console.log('\n=== Checking .env file directly ===');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.resolve(__dirname, '../../');
    const envPath = path.join(rootDir, '.env');

    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');

        let clientIdLine = lines.find(line => line.startsWith('PAYPAL_CLIENT_ID='));
        let clientSecretLine = lines.find(line => line.startsWith('PAYPAL_CLIENT_SECRET='));

        console.log('PAYPAL_CLIENT_ID line in .env:', clientIdLine || 'Not found');
        console.log('PAYPAL_CLIENT_SECRET line in .env:', clientSecretLine || 'Not found');
    } else {
        console.log('.env file not found at:', envPath);
    }
} catch (error) {
    console.error('Error checking .env file:', error);
}
