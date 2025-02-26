// Script to help set up PayPal credentials
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const envPath = path.join(rootDir, '.env');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to read the .env file
function readEnvFile() {
    try {
        if (fs.existsSync(envPath)) {
            return fs.readFileSync(envPath, 'utf8');
        }
        return '';
    } catch (error) {
        console.error('Error reading .env file:', error);
        return '';
    }
}

// Function to update the .env file
function updateEnvFile(content) {
    try {
        fs.writeFileSync(envPath, content, 'utf8');
        console.log('✅ .env file updated successfully');
    } catch (error) {
        console.error('❌ Error updating .env file:', error);
    }
}

// Function to update or add a variable in the .env content
function updateEnvVariable(content, key, value) {
    const regex = new RegExp(`^${key}=.*`, 'm');
    const newLine = `${key}=${value}`;

    if (regex.test(content)) {
        // Update existing variable
        return content.replace(regex, newLine);
    } else {
        // Add new variable
        return content + (content.endsWith('\n') ? '' : '\n') + newLine + '\n';
    }
}

// Main function
async function main() {
    console.log('PayPal Credentials Setup Utility');
    console.log('===============================');
    console.log('This utility will help you set up your PayPal API credentials.');
    console.log('You can find these in your PayPal Developer Dashboard.');
    console.log('');

    // Read current .env file
    let envContent = readEnvFile();

    // Extract current values if they exist
    const clientIdMatch = envContent.match(/^PAYPAL_CLIENT_ID=(.*)$/m);
    const clientSecretMatch = envContent.match(/^PAYPAL_CLIENT_SECRET=(.*)$/m);

    const currentClientId = clientIdMatch ? clientIdMatch[1] : '';
    const currentClientSecret = clientSecretMatch ? clientSecretMatch[1] : '';

    // Ask for Client ID
    const clientId = await new Promise(resolve => {
        rl.question(`Enter your PayPal Client ID ${currentClientId ? `(current: ${currentClientId.substring(0, 4)}...${currentClientId.substring(currentClientId.length - 4)})` : ''}: `, answer => {
            resolve(answer.trim() || currentClientId);
        });
    });

    // Ask for Client Secret
    const clientSecret = await new Promise(resolve => {
        rl.question(`Enter your PayPal Client Secret ${currentClientSecret ? `(current: ${currentClientSecret.substring(0, 4)}...${currentClientSecret.substring(currentClientSecret.length - 4)})` : ''}: `, answer => {
            resolve(answer.trim() || currentClientSecret);
        });
    });

    // Update .env content
    if (clientId) {
        envContent = updateEnvVariable(envContent, 'PAYPAL_CLIENT_ID', clientId);
    }

    if (clientSecret) {
        envContent = updateEnvVariable(envContent, 'PAYPAL_CLIENT_SECRET', clientSecret);
    }

    // Write updated content to .env file
    if (clientId || clientSecret) {
        updateEnvFile(envContent);
    } else {
        console.log('No changes made to .env file');
    }

    // Close readline interface
    rl.close();

    console.log('\nTo test your credentials, run:');
    console.log('node app/utils/check-paypal-credentials.js');
}

// Run the main function
main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});
