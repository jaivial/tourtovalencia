#!/usr/bin/env node

/**
 * Blog Scheduler Diagnostic Script
 * 
 * Run with: node scripts/blog-scheduler-diagnostic.js
 * Or with environment: MONGODB_URI=mongodb://localhost:27017/tourtovalencia node scripts/blog-scheduler-diagnostic.js
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tourtovalencia';
const DB_NAME = MONGO_URI.includes('/') ? MONGO_URI.split('/').pop().split('?')[0] : 'tourtovalencia';

async function runDiagnostics() {
  const client = new MongoClient(MONGO_URI);
  
  console.log('\n========================================');
  console.log('   BLOG SCHEDULER DIAGNOSTIC REPORT');
  console.log('========================================\n');
  console.log(`MongoDB URI: ${MONGO_URI}`);
  console.log(`Database: ${DB_NAME}\n`);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Check Blog Settings
    console.log('--- BLOG SETTINGS ---');
    const settings = await db.collection('blogsettings').findOne({ key: 'default' });
    
    if (!settings) {
      console.log('❌ ERROR: No blog settings found in database!');
      console.log('   Run the app once to initialize settings.\n');
    } else {
      const now = new Date();
      const nextRunAt = settings.nextRunAt ? new Date(settings.nextRunAt) : null;
      const lockedUntil = settings.lockedUntil ? new Date(settings.lockedUntil) : null;
      const isLocked = lockedUntil && lockedUntil > now;
      const isOverdue = nextRunAt && nextRunAt <= now;
      
      console.log(`Frequency: ${settings.frequency}`);
      console.log(`Publish Hour: ${settings.publishHour}:00`);
      console.log(`Selected Weekdays: ${settings.selectedWeekdays?.join(', ') || 'Not set'}`);
      console.log(`\nNext Run At: ${nextRunAt ? nextRunAt.toISOString() : 'Not set'}`);
      console.log(`Last Run At: ${settings.lastRunAt ? new Date(settings.lastRunAt).toISOString() : 'Never'}`);
      console.log(`Last Error: ${settings.lastError || 'None'}`);
      console.log(`\nLocked Until: ${lockedUntil ? lockedUntil.toISOString() : 'Not locked'}`);
      console.log(`Is Currently Locked: ${isLocked ? 'YES ⚠️' : 'NO ✅'}`);
      console.log(`Is Overdue: ${isOverdue ? 'YES ⚠️' : 'NO ✅'}`);
      
      if (isLocked) {
        console.log(`\n⚠️  WARNING: Scheduler is locked!`);
        console.log(`   The lock will expire at: ${lockedUntil.toISOString()}`);
        console.log(`   Time remaining: ${Math.round((lockedUntil - now) / 60000)} minutes`);
      }
      
      if (isOverdue && !isLocked) {
        console.log(`\n⚠️  WARNING: Jobs are overdue!`);
        console.log(`   The scheduler should have run at: ${nextRunAt.toISOString()}`);
      }
    }
    
    // Check Active Tours
    console.log('\n--- ACTIVE TOURS ---');
    const toursCount = await db.collection('tours').countDocuments({ status: 'active' });
    console.log(`Active Tours: ${toursCount}`);
    
    if (toursCount === 0) {
      console.log('❌ ERROR: No active tours found!');
      console.log('   The blog generator requires at least one active tour.');
    } else {
      console.log('✅ Tours available for blog generation');
    }
    
    // Check Blog Posts
    console.log('\n--- BLOG POSTS ---');
    const postsCount = await db.collection('blogposts').countDocuments();
    console.log(`Total Posts: ${postsCount}`);
    
    const recentPosts = await db.collection('blogposts')
      .find({})
      .sort({ publishedAt: -1 })
      .limit(5)
      .toArray();
    
    if (recentPosts.length > 0) {
      console.log('\nMost Recent Posts:');
      recentPosts.forEach((post, i) => {
        const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Unknown';
        console.log(`  ${i + 1}. ${post.slug} - ${date}`);
      });
    }
    
    // Check Indexes
    console.log('\n--- DATABASE INDEXES ---');
    const settingsIndexes = await db.collection('blogsettings').indexes();
    console.log('Blog Settings Indexes:');
    settingsIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    const hasLockedUntilIndex = settingsIndexes.some(idx => idx.key.lockedUntil);
    console.log(`\nlockedUntil Index: ${hasLockedUntilIndex ? '✅ EXISTS' : '❌ MISSING'}`);
    
    // Environment Check
    console.log('\n--- ENVIRONMENT ---');
    console.log(`GOOGLE_AI_API_KEY: ${process.env.GOOGLE_AI_API_KEY ? '✅ Set' : '❌ NOT SET'}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    
    // Summary
    console.log('\n========================================');
    console.log('              SUMMARY');
    console.log('========================================\n');
    
    const issues = [];
    
    if (!settings) issues.push('No blog settings found');
    if (toursCount === 0) issues.push('No active tours');
    if (!process.env.GOOGLE_AI_API_KEY) issues.push('GOOGLE_AI_API_KEY not set');
    if (isLocked) issues.push('Scheduler is locked');
    if (isOverdue && !isLocked) issues.push('Jobs are overdue');
    
    if (issues.length === 0) {
      console.log('✅ All checks passed! The scheduler should work correctly.');
      console.log('\nIf automation is still not working:');
      console.log('  1. Check PM2 logs: pm2 logs tourtovalencia');
      console.log('  2. Try manual generation from admin panel');
      console.log('  3. Ensure the server is receiving traffic');
    } else {
      console.log(`❌ Found ${issues.length} issue(s):`);
      issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    }
    
    console.log('\n========================================\n');
    
  } catch (error) {
    console.error('\n❌ DIAGNOSTIC FAILED:', error.message);
    console.log('\nMake sure:');
    console.log('  1. MongoDB is running');
    console.log('  2. MONGODB_URI is correct');
    console.log('  3. The database exists\n');
  } finally {
    await client.close();
  }
}

runDiagnostics();
