# Migration Scripts

This directory contains utility scripts for managing database migrations.

## 📋 Available Scripts

### `run-migration.js`

A Node.js script to run SQL migrations programmatically against your Neon database.

#### Prerequisites

```bash
npm install pg
```

#### Usage

```bash
# Run the migration
node scripts/run-migration.js

# or
node scripts/run-migration.js migrate

# Verify the migration succeeded
node scripts/run-migration.js verify

# Rollback the migration (with confirmation prompt)
node scripts/run-migration.js rollback
```

#### Environment Variables

Make sure your `DATABASE_URL` is set:

```bash
# In .env file
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# Or export it
export DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
```

## 🔍 Script Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `migrate` | `up` | Runs the main migration script |
| `verify` | `check` | Verifies migration was successful |
| `rollback` | `down` | Rolls back the migration (⚠️ deletes data!) |

## 📝 Examples

### Running Migration

```bash
$ node scripts/run-migration.js
═══════════════════════════════════════
   Neon Database Migration Tool
═══════════════════════════════════════

🚀 Starting migration...

📝 Executing SQL migration...

✅ Migration completed successfully!

Next steps:
  1. Run: npx prisma generate
  2. Test the new features at /projects/new
  3. Visit /discover to see collaborative projects
```

### Verifying Migration

```bash
$ node scripts/run-migration.js verify
═══════════════════════════════════════
   Neon Database Migration Tool
═══════════════════════════════════════

🔍 Verifying migration...

--- Check 1 ---
┌─────────┬────────────────────────────┬────────────────┐
│ (index) │           step             │     status     │
├─────────┼────────────────────────────┼────────────────┤
│    0    │ 'Checking new tables...'   │      true      │
└─────────┴────────────────────────────┴────────────────┘

✅ Verification completed!
```

### Rolling Back

```bash
$ node scripts/run-migration.js rollback
═══════════════════════════════════════
   Neon Database Migration Tool
═══════════════════════════════════════

⚠️  Rolling back migration...

⚠️  This will DELETE all collaboration data. Continue? (yes/no): yes

📝 Executing rollback...

✅ Rollback completed successfully!
```

## 🛡️ Safety Features

- **Environment validation**: Checks for `DATABASE_URL` before running
- **File existence checks**: Ensures SQL files exist before execution
- **Error handling**: Catches and reports errors clearly
- **Rollback confirmation**: Requires explicit "yes" confirmation
- **Connection pooling**: Uses proper PostgreSQL connection handling

## 🐛 Troubleshooting

### "pg library not found"

```bash
npm install pg
```

### "DATABASE_URL environment variable is not set"

```bash
# Create .env file or export the variable
export DATABASE_URL="your_neon_connection_string"
```

### "File not found"

Make sure you're running the script from the project root:

```bash
# From project root
node scripts/run-migration.js

# Not from scripts directory
# ❌ cd scripts && node run-migration.js
```

### Connection errors

- Verify your Neon database is running
- Check your connection string is correct
- Ensure your IP is allowlisted in Neon (if IP restrictions are enabled)

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Library](https://node-postgres.com/)

## 🔗 Related Files

- `../migrations/add_team_collaboration.sql` - Main migration
- `../migrations/verify_migration.sql` - Verification queries
- `../migrations/rollback_team_collaboration.sql` - Rollback script
- `../migrations/README.md` - Detailed migration documentation
