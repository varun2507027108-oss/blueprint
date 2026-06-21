import sqlite3
import json

def main():
    conn = sqlite3.connect('founder_os.db')
    cursor = conn.execute("SELECT payload_json FROM artifacts WHERE stage_name='architect' ORDER BY version DESC LIMIT 1")
    row = cursor.fetchone()
    if row:
        data = json.loads(row[0])
        print("SQL schema:")
        print(data.get('db_schema_sql', 'No SQL'))
        print("\nMermaid schema:")
        print(data.get('db_schema_mermaid', 'No Mermaid'))
    else:
        print("No architect artifact found")

if __name__ == '__main__':
    main()
