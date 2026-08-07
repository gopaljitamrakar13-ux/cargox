import sqlite3

conn = sqlite3.connect('instance/cargox.db')
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tables:", [t[0] for t in tables])

# Check users
cursor.execute("SELECT id, email, role_id FROM users")
users = cursor.fetchall()
print(f"\nUsers ({len(users)}):")
for u in users:
    print(f"  {u}")

# Check roles
cursor.execute("SELECT id, name FROM roles")
roles = cursor.fetchall()
print(f"\nRoles ({len(roles)}):")
for r in roles:
    print(f"  {r}")

# Check customers
cursor.execute("SELECT id, user_id, full_name FROM customers")
customers = cursor.fetchall()
print(f"\nCustomers ({len(customers)}):")
for c in customers:
    print(f"  {c}")

conn.close()
