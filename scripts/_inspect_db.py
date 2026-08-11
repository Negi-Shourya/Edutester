import sqlite3

con = sqlite3.connect('edutester.db')
con.row_factory = sqlite3.Row
cur = con.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print('TABLES:', [r[0] for r in cur.fetchall()])
for t in ('questions', 'question_bank'):
    try:
        cur.execute(f'PRAGMA table_info({t})')
        print(t, 'COLS:', [(r['name'], r['type']) for r in cur.fetchall()])
    except Exception as e:
        print(t, 'ERR', e)

cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%question%'")
for r in cur.fetchall():
    t = r[0]
    if t == 'questions':
        continue
    cur.execute(f'PRAGMA table_info({t})')
    cols = [(c['name'], c['type']) for c in cur.fetchall()]
    print(t, 'COLS:', cols)
