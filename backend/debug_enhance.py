import requests
import json

try:
    print("Testing /api/enhance endpoint...")
    response = requests.post(
        "http://localhost:8000/api/enhance",
        json={"prompt": "Test prompt"},
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {response.json()}")
    except:
        print(f"Response Text: {response.text}")

except Exception as e:
    print(f"Request failed: {e}")
