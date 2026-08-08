import requests
import time

BASE_URL = 'http://localhost:5000/api'

def run_tests():
    print("Running API tests...")
    
    # 1. Health check
    try:
        r = requests.get(f"{BASE_URL}/health")
        print("Health Check:", r.status_code, r.json())
    except Exception as e:
        print("Health Check Failed:", e)

    # 2. Register
    email = f"test_{int(time.time())}@cargox.com"
    password = "password123"
    try:
        r = requests.post(f"{BASE_URL}/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "API Test User",
            "role": "Customer"
        })
        print("Register:", r.status_code, r.json())
    except Exception as e:
        print("Register Failed:", e)
        
    # 3. Login
    access_token = None
    try:
        r = requests.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": password
        })
        print("Login:", r.status_code, r.json())
        if r.status_code == 200:
            access_token = r.json().get('access_token')
    except Exception as e:
        print("Login Failed:", e)

    if not access_token:
        print("Cannot continue tests without token")
        return
        
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 4. Profile
    try:
        r = requests.get(f"{BASE_URL}/users/profile", headers=headers)
        print("Profile:", r.status_code, r.json())
    except Exception as e:
        print("Profile Failed:", e)
        
    # 5. Create Shipment
    shipment_id = None
    try:
        r = requests.post(f"{BASE_URL}/shipments/", headers=headers, json={
            "pickup_address": "123 Test St",
            "dropoff_address": "456 Drop Ave",
            "weight_tons": 5.0,
            "material_type": "Steel"
        })
        print("Create Shipment:", r.status_code, r.json())
        if r.status_code == 201:
            shipment_id = r.json().get('id')
    except Exception as e:
        print("Create Shipment Failed:", e)
        
    # 6. List Shipments
    try:
        r = requests.get(f"{BASE_URL}/shipments/", headers=headers)
        print("List Shipments:", r.status_code, len(r.json()), "items")
    except Exception as e:
        print("List Shipments Failed:", e)

if __name__ == '__main__':
    run_tests()
