import pandas as pd

# Load master
try:
    master = pd.read_csv('long_read_tools_master.csv', encoding='latin-1')
except Exception as e:
    master = pd.read_csv('long_read_tools_master.csv', encoding='cp1252')

# Load no conflicts
try:
    no_conflicts = pd.read_csv('new_submissions_no_conflicts.csv', encoding='utf-8')
    no_conflicts = no_conflicts.rename(columns={'Name': 'Tool', 'DOIs': 'DOI', 'Platform': 'Programming_Language', 'Description': 'Details', 'Code': 'Source'})
    master = pd.concat([master, no_conflicts], ignore_index=True)
except Exception as e:
    pass

# Load conflicts and resolve
try:
    conflicts = pd.read_csv('new_submissions_conflicts.csv', encoding='utf-8')
    conflicts = conflicts.rename(columns={'Name': 'Tool', 'DOIs': 'DOI', 'Platform': 'Programming_Language', 'Description': 'Details', 'Code': 'Source'})
    
    # Resolve conflicts by preferring auto-detected platform and license
    conflicts['Programming_Language'] = conflicts['Platform_auto'].fillna(conflicts['Programming_Language'])
    conflicts['License'] = conflicts['License_auto'].fillna(conflicts['License'])
    
    # Drop the extra columns added during check
    cols_to_drop = ['Duplicated', 'Platform_auto', 'License_auto', 'Github']
    conflicts = conflicts.drop(columns=[c for c in cols_to_drop if c in conflicts.columns])
    
    master = pd.concat([master, conflicts], ignore_index=True)
except Exception as e:
    pass

# Save master
master.to_csv('long_read_tools_master.csv', index=False, encoding='latin-1')
print("Successfully appended tools to master CSV.")
