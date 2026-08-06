import os
import sys
import re

# We will parse SQL files and translate PostgreSQL to SQLite.
# Note that we only need this translation to be robust enough to compile the tables, primary keys, and foreign keys.
# Let's write a simple transpiler.

def pg_to_sqlite(sql):
    # Remove Postgres-specific schema references and system constructs
    sql = sql.replace('public.', '')

    # Remove schema specifications in constraints
    sql = re.sub(r'references\s+public\.', 'references ', sql, flags=re.IGNORECASE)
    sql = re.sub(r'references\s+auth\.users', 'references users', sql, flags=re.IGNORECASE)

    # Replace uuid default gen_random_uuid() / uuid_generate_v4()
    sql = re.sub(r'uuid\s+primary\s+key\s+default\s+gen_random_uuid\(\)', 'text primary key', sql, flags=re.IGNORECASE)
    sql = re.sub(r'uuid\s+primary\s+key\s+default\s+uuid_generate_v4\(\)', 'text primary key', sql, flags=re.IGNORECASE)
    sql = re.sub(r'primary\s+key\s+default\s+gen_random_uuid\(\)', 'primary key', sql, flags=re.IGNORECASE)
    sql = re.sub(r'primary\s+key\s+default\s+uuid_generate_v4\(\)', 'primary key', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\buuid\b', 'text', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\btimestamptz\b', 'text', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\btimestamp\b', 'text', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bjsonb\b', 'text', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bjson\b', 'text', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\btext\[\]\b', 'text', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bbool\b', 'boolean', sql, flags=re.IGNORECASE)

    # Replace now() defaults
    sql = re.sub(r'default\s+now\(\)', "default (datetime('now'))", sql, flags=re.IGNORECASE)

    # Remove pg-specific index extensions like GIN, gist, etc.
    sql = re.sub(r'using\s+gin\s*\([^)]+\)', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'using\s+gist\s*\([^)]+\)', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'using\s+btree\s*', '', sql, flags=re.IGNORECASE)

    # Remove partial index clauses with where
    # SQLite does support partial indexes, but let's be careful.

    # Remove RLS statements
    sql = re.sub(r'alter\s+table\s+.*?\s+enable\s+row\s+level\s+security.*?;', '', sql, flags=re.IGNORECASE | re.DOTALL)
    sql = re.sub(r'alter\s+table\s+.*?\s+force\s+row\s+level\s+security.*?;', '', sql, flags=re.IGNORECASE | re.DOTALL)

    # Remove create policy statements
    sql = re.sub(r'create\s+policy\s+.*?\s+on\s+.*?;', '', sql, flags=re.IGNORECASE | re.DOTALL)
    sql = re.sub(r'drop\s+policy\s+.*?;', '', sql, flags=re.IGNORECASE | re.DOTALL)

    # Remove select/insert grants
    sql = re.sub(r'grant\s+.*?\s+to\s+.*?;', '', sql, flags=re.IGNORECASE | re.DOTALL)

    # Remove trigger statements
    sql = re.sub(r'create\s+trigger\s+.*?;', '', sql, flags=re.IGNORECASE | re.DOTALL)
    sql = re.sub(r'drop\s+trigger\s+.*?;', '', sql, flags=re.IGNORECASE | re.DOTALL)

    # Remove create function statements (PL/pgSQL is not supported by SQLite)
    # We find create or replace function ... end; or similar.
    # A simple regex for matching PL/pgSQL function definitions:
    sql = re.sub(r'create\s+(?:or\s+replace\s+)?function\s+.*?\s+as\s+\$\$.*?\$\$\s*;', '', sql, flags=re.IGNORECASE | re.DOTALL)
    sql = re.sub(r'create\s+(?:or\s+replace\s+)?function\s+.*?\s+language\s+plpgsql\s+as\s+\$\$.*?\$\$\s*;', '', sql, flags=re.IGNORECASE | re.DOTALL)

    # Remove extensions and DO blocks
    sql = re.sub(r'create\s+extension\s+.*?;', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'do\s+\$\$.*?\$\$\s*;', '', sql, flags=re.IGNORECASE | re.DOTALL)

    # Remove comments
    sql = re.sub(r'--.*$', '', sql, flags=re.MULTILINE)
    sql = re.sub(r'/\*.*?\*/', '', sql, flags=re.DOTALL)

    # Clean empty lines
    lines = [l for l in sql.split('\n') if l.strip()]
    return '\n'.join(lines)

import sqlite3

def run_simulation():
    migration_dir = 'supabase/migrations'
    files = [f for f in os.listdir(migration_dir) if f.endswith('.sql')]
    files.sort()

    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()

    # Pre-create standard auth.users table in sqlite
    cursor.execute("CREATE TABLE users (id text primary key, email text)")

    print("--- SIMULATING SQL MIGRATIONS ON IN-MEMORY SQLite ---")

    for f in files:
        num = int(f.split('_')[0])
        print(f"\n[{f}]")
        filepath = os.path.join(migration_dir, f)
        with open(filepath, 'r', encoding='utf-8') as fh:
            raw_sql = fh.read()

        transpiled = pg_to_sqlite(raw_sql)
        # Split by semicolon
        # Very naive splitting (handles semicolons inside statements unless we have them in strings/etc)
        statements = transpiled.split(';')
        for stmt in statements:
            stmt = stmt.strip()
            if not stmt:
                continue

            try:
                # We skip certain statements that SQLite won't like (e.g. storage.buckets insertions)
                if 'storage.buckets' in stmt.lower() or 'storage.objects' in stmt.lower():
                    continue
                if 'create type' in stmt.lower() or 'drop type' in stmt.lower():
                    continue

                cursor.execute(stmt)
                print(f"  [OK] {stmt[:60]}...")
            except sqlite3.OperationalError as e:
                # We expect some failures for pure PG functions, triggers, alter table add primary key, etc.
                # But let's log them to inspect
                print(f"  [FAIL] {stmt[:60]}... -> {e}")

    # Inspect final tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print("\n--- FINAL CREATED TABLES ---")
    for t in tables:
        print(f" - {t[0]}")

if __name__ == "__main__":
    run_simulation()
