#!/usr/bin/env node

/**
 * Script to help identify route files that need WhatsApp sharing metadata
 * 
 * Usage:
 * 1. Run this script with: node scripts/update-meta.js
 * 2. It will list all route files that don't have the generateSocialMeta import
 * 3. For each file, you can manually update the meta function using the pattern:
 * 
 * import { generateSocialMeta } from "~/utils/meta.utils";
 * 
 * export const meta: MetaFunction = () => {
 *   const title = "Your Page Title | Tour To Valencia";
 *   const description = "Your page description here, keep it under 160 characters for best results.";
 *   
 *   return generateSocialMeta(title, description, "/your-route-path");
 * };
 */

const fs = require('fs');
const path = require('path');

// Directory containing route files - assuming script is run from project root
const routesDir = './app/routes';

// Function to check if a file has the generateSocialMeta import
function checkFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check if the file already has the generateSocialMeta import
        const hasImport = content.includes('generateSocialMeta');

        // Check if the file has a meta export
        const hasMeta = content.includes('export const meta');

        return {
            path: filePath,
            hasImport,
            hasMeta,
            needsUpdate: !hasImport && hasMeta
        };
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return { path: filePath, error: true };
    }
}

// Function to recursively get all .tsx files in a directory
function getTsxFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            // Recursively search directories
            results = results.concat(getTsxFiles(filePath));
        } else if (path.extname(file) === '.tsx') {
            // Add .tsx files
            results.push(filePath);
        }
    });

    return results;
}

// Main function
function main() {
    console.log('Checking route files for WhatsApp sharing metadata...\n');

    // Get all .tsx files in the routes directory
    const files = getTsxFiles(routesDir);

    // Check each file
    const results = files.map(file => checkFile(file));

    // Filter files that need updates
    const needsUpdate = results.filter(result => result.needsUpdate);

    console.log(`Found ${needsUpdate.length} files that need WhatsApp sharing metadata updates:\n`);

    // Print files that need updates
    needsUpdate.forEach((result, index) => {
        console.log(`${index + 1}. ${result.path}`);
    });

    console.log('\nTo update these files, add the following to each file:');
    console.log('\n1. Add the import:');
    console.log('import { generateSocialMeta } from "~/utils/meta.utils";');
    console.log('import type { MetaFunction } from "@remix-run/react";');

    console.log('\n2. Update the meta function:');
    console.log('export const meta: MetaFunction = () => {');
    console.log('  const title = "Your Page Title | Tour To Valencia";');
    console.log('  const description = "Your page description here, keep it under 160 characters.";');
    console.log('  ');
    console.log('  return generateSocialMeta(title, description, "/your-route-path");');
    console.log('};');
}

// Run the script
main(); 