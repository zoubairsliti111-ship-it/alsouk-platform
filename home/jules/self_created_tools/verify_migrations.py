import os
import re
import sys

def get_sql_files(directory):
    files = [f for f in os.listdir(directory) if f.endswith('.sql')]
    files.sort()
    return files

def parse_sql_objects(filepath):
    """
    Parses a SQL migration file to identify objects created/defined.
    We are looking for:
    - Tables: CREATE TABLE [IF NOT EXISTS] public.<name>
    - Functions: CREATE [OR REPLACE] FUNCTION public.<name>
    - Types: CREATE TYPE public.<name>
    - Triggers: CREATE TRIGGER <name>
    - Policies: CREATE POLICY <name> ON public.<tbl>
    - Buckets: INSERT INTO storage.buckets ...
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove comments
    # Multiline comments /* ... */
    content_clean = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    # Single line comments -- ...
    content_clean = re.sub(r'--.*$', '', content_clean, flags=re.MULTILINE)

    objects = {
        'tables': set(),
        'functions': set(),
        'types': set(),
        'triggers': set(),
        'policies': set(),
        'buckets': set(),
        'columns_added': [] # list of (table, column)
    }

    # Match tables
    # Match "create table [if not exists] <name>"
    table_matches = re.finditer(r'create\s+table\s+(?:if\s+not\s+exists\s+)?([\w\.]+)', content_clean, re.IGNORECASE)
    for m in table_matches:
        tbl = m.group(1).lower().replace('public.', '')
        objects['tables'].add(tbl)

    # Match functions
    # Match "create [or replace] function <name>"
    func_matches = re.finditer(r'create\s+(?:or\s+replace\s+)?function\s+([\w\.]+)', content_clean, re.IGNORECASE)
    for m in func_matches:
        func = m.group(1).lower().replace('public.', '')
        objects['functions'].add(func)

    # Match types (enums, etc.)
    # Match "create type <name>"
    type_matches = re.finditer(r'create\s+type\s+([\w\.]+)', content_clean, re.IGNORECASE)
    for m in type_matches:
        tp = m.group(1).lower().replace('public.', '')
        objects['types'].add(tp)

    # Match triggers
    # Match "create trigger <name>"
    trigger_matches = re.finditer(r'create\s+trigger\s+(\w+)', content_clean, re.IGNORECASE)
    for m in trigger_matches:
        trig = m.group(1).lower()
        objects['triggers'].add(trig)

    # Match policies
    # Match "create policy <name> on <table_name>"
    policy_matches = re.finditer(r'create\s+policy\s+"?([^"]+)"?\s+on\s+([\w\.]+)', content_clean, re.IGNORECASE)
    for m in policy_matches:
        pol = m.group(1).lower()
        tbl = m.group(2).lower().replace('public.', '')
        objects['policies'].add((tbl, pol))

    # Match alter table columns
    # Match "alter table <name> add column [if not exists] <col>"
    alter_matches = re.finditer(r'alter\s+table\s+(?:only\s+)?([\w\.]+)\s+add\s+column\s+(?:if\s+not\s+exists\s+)?(\w+)', content_clean, re.IGNORECASE)
    for m in alter_matches:
        tbl = m.group(1).lower().replace('public.', '')
        col = m.group(2).lower()
        objects['columns_added'].append((tbl, col))

    # Match storage bucket insertions
    bucket_matches = re.finditer(r"insert\s+into\s+storage\.buckets\s*\([^)]*\)\s*values\s*\(\s*'([^']+)'", content_clean, re.IGNORECASE)
    for m in bucket_matches:
        objects['buckets'].add(m.group(1).lower())

    return objects

def main():
    migration_dir = 'supabase/migrations'
    if not os.path.exists(migration_dir):
        print(f"Directory {migration_dir} not found.")
        sys.exit(1)

    all_files = get_sql_files(migration_dir)
    baseline_files = [f for f in all_files if int(f.split('_')[0]) < 18]
    staging_files = [f for f in all_files if 18 <= int(f.split('_')[0]) <= 27]

    print(f"Found {len(baseline_files)} baseline migrations (0000-0017)")
    print(f"Found {len(staging_files)} staging migrations (0018-0027)")

    # Aggregate baseline objects
    baseline_objs = {
        'tables': {},
        'functions': {},
        'types': {},
        'triggers': {},
        'policies': {},
        'buckets': {},
        'columns_added': []
    }

    for f in baseline_files:
        path = os.path.join(migration_dir, f)
        objs = parse_sql_objects(path)
        for k in ['tables', 'functions', 'types', 'triggers', 'buckets']:
            for item in objs[k]:
                if item not in baseline_objs[k]:
                    baseline_objs[k][item] = []
                baseline_objs[k][item].append(f)
        for item in objs['policies']:
            if item not in baseline_objs['policies']:
                baseline_objs['policies'][item] = []
            baseline_objs['policies'][item].append(f)
        for item in objs['columns_added']:
            baseline_objs['columns_added'].append((item[0], item[1], f))

    # Review staging files
    print("\n--- STAGING MIGRATION REVIEW ---")
    warnings = 0
    errors = 0

    for f in staging_files:
        print(f"\nAnalyzing staging migration: {f}")
        path = os.path.join(migration_dir, f)
        objs = parse_sql_objects(path)

        # Check for table duplicate creation
        for tbl in objs['tables']:
            if tbl in baseline_objs['tables']:
                print(f"  [CONFLICT] Table '{tbl}' created in {f} already exists in baseline {baseline_objs['tables'][tbl]}.")
                errors += 1
            else:
                print(f"  [OK] New Table: '{tbl}'")

        # Check for function definitions
        for func in objs['functions']:
            if func in baseline_objs['functions']:
                print(f"  [WARNING] Function '{func}' defined in {f} also exists in baseline {baseline_objs['functions'][func]}. Check if CREATE OR REPLACE is used.")
                warnings += 1
            else:
                print(f"  [OK] New Function: '{func}'")

        # Check for type definitions
        for tp in objs['types']:
            if tp in baseline_objs['types']:
                print(f"  [CONFLICT] Type '{tp}' defined in {f} already exists in baseline {baseline_objs['types'][tp]}.")
                errors += 1
            else:
                print(f"  [OK] New Type: '{tp}'")

        # Check for triggers
        for trig in objs['triggers']:
            if trig in baseline_objs['triggers']:
                print(f"  [WARNING] Trigger '{trig}' in {f} also exists in baseline {baseline_objs['triggers'][trig]}.")
                warnings += 1

        # Check for bucket insertions
        for bkt in objs['buckets']:
            if bkt in baseline_objs['buckets']:
                print(f"  [WARNING] Storage Bucket '{bkt}' inserted in {f} also exists in baseline {baseline_objs['buckets'][bkt]}.")
                warnings += 1

        # Check for added columns
        for tbl, col in objs['columns_added']:
            # See if it already exists or is added in baseline
            # Check if column is already defined in base table
            # Since we don't parse complete table definitions, let's just check if column is added elsewhere or exists in baseline tables.
            # A baseline columns search:
            match = [bf for t, c, bf in baseline_objs['columns_added'] if t == tbl and c == col]
            if match:
                print(f"  [WARNING] Column '{col}' added to table '{tbl}' in {f} is also added in baseline {match}.")
                warnings += 1

    print(f"\nReview complete: {errors} Errors, {warnings} Warnings.")

if __name__ == "__main__":
    main()
