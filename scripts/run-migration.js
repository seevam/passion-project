/**
 * Migration Runner for Neon Database
 *
 * This script runs SQL migrations programmatically against your Neon database.
 *
 * Usage:
 *   node scripts/run-migration.js
 *   node scripts/run-migration.js verify
 *   node scripts/run-migration.js rollback
 */

const fs = require('fs');
const path = require('path');

// Try to load postgres library
let Pool;
try {
  Pool = require('pg').Pool;
} catch (error) {
  console.error('❌ Error: pg library not found. Please install it:');
  console.error('   npm install pg');
  process.exit(1);
}

// Configuration
const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
};

// Validate configuration
if (!config.connectionString) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('   Please set it in your .env file or export it:');
  console.error('   export DATABASE_URL="postgresql://user:pass@host/db"');
  process.exit(1);
}

const pool = new Pool(config);

/**
 * Read SQL file
 */
function readSQLFile(filename) {
  const filePath = path.join(__dirname, '..', 'migrations', filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Run migration
 */
async function runMigration() {
  console.log('🚀 Starting migration...\n');

  try {
    const sql = readSQLFile('add_team_collaboration.sql');

    console.log('📝 Executing SQL migration...');
    const result = await pool.query(sql);

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Run: npx prisma generate');
    console.log('  2. Test the new features at /projects/new');
    console.log('  3. Visit /discover to see collaborative projects\n');

    return true;
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error.message);
    console.error('\nError details:', error);
    return false;
  }
}

/**
 * Verify migration
 */
async function verifyMigration() {
  console.log('🔍 Verifying migration...\n');

  try {
    const sql = readSQLFile('verify_migration.sql');

    const result = await pool.query(sql);

    // Display results
    if (result.length > 0) {
      result.forEach((res, index) => {
        if (res.rows && res.rows.length > 0) {
          console.log(`\n--- Check ${index + 1} ---`);
          console.table(res.rows);
        }
      });
    } else if (result.rows) {
      console.table(result.rows);
    }

    console.log('\n✅ Verification completed!');
    return true;
  } catch (error) {
    console.error('\n❌ Verification failed:');
    console.error(error.message);
    return false;
  }
}

/**
 * Rollback migration
 */
async function rollbackMigration() {
  console.log('⚠️  Rolling back migration...\n');

  // Confirm rollback
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question(
      '⚠️  This will DELETE all collaboration data. Continue? (yes/no): ',
      async (answer) => {
        readline.close();

        if (answer.toLowerCase() !== 'yes') {
          console.log('\n❌ Rollback cancelled');
          resolve(false);
          return;
        }

        try {
          const sql = readSQLFile('rollback_team_collaboration.sql');

          console.log('\n📝 Executing rollback...');
          await pool.query(sql);

          console.log('\n✅ Rollback completed successfully!');
          console.log('\nNext steps:');
          console.log('  1. Run: npx prisma generate');
          console.log('  2. Restart your application\n');

          resolve(true);
        } catch (error) {
          console.error('\n❌ Rollback failed:');
          console.error(error.message);
          resolve(false);
        }
      }
    );
  });
}

/**
 * Main function
 */
async function main() {
  const command = process.argv[2] || 'migrate';

  console.log('═══════════════════════════════════════');
  console.log('   Neon Database Migration Tool');
  console.log('═══════════════════════════════════════\n');

  let success = false;

  try {
    switch (command) {
      case 'migrate':
      case 'up':
        success = await runMigration();
        break;

      case 'verify':
      case 'check':
        success = await verifyMigration();
        break;

      case 'rollback':
      case 'down':
        success = await rollbackMigration();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('\nAvailable commands:');
        console.log('  migrate, up       - Run the migration');
        console.log('  verify, check     - Verify migration success');
        console.log('  rollback, down    - Rollback the migration');
        success = false;
    }
  } catch (error) {
    console.error('\n❌ Unexpected error:');
    console.error(error);
    success = false;
  } finally {
    await pool.end();
  }

  process.exit(success ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { runMigration, verifyMigration, rollbackMigration };
