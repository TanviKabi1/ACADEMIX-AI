import requests

BASE_URL = "http://localhost:8000/api"

def test_upload():
    # 1. Register/Login
    print("Logging in...")
    login_data = {"email": "test@example.com", "password": "password123"}
    resp = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if resp.status_code != 200:
        print("Login failed, registering...")
        reg_data = {"email": "test@example.com", "password": "password123", "name": "Tester"}
        resp = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Upload
    print("Uploading file...")
    files = {'file': ('test.txt', 'This is a test document about artificial intelligence. It has some content.')}
    resp = requests.post(f"{BASE_URL}/documents/upload", headers=headers, files=files)
    
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")

if __name__ == "__main__":
    test_upload()
