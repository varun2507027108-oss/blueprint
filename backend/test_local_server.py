import urllib.request
import urllib.error
import json

url = "http://localhost:8000/sessions/3884080f-c854-4645-a189-efde06d1b0ae"
print(f"Sending GET request to local server: {url}")
try:
    with urllib.request.urlopen(url) as response:
        status_code = response.getcode()
        body = response.read().decode('utf-8')
        print(f"Status Code: {status_code}")
        print("Response Body:")
        print(json.dumps(json.loads(body), indent=2))
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} - {e.reason}")
    try:
        error_body = e.read().decode('utf-8')
        print("Error Response Body:")
        print(error_body)
    except Exception:
        pass
except urllib.error.URLError as e:
    print(f"URLError: Failed to reach the server. Reason: {e.reason}")
except Exception as e:
    print(f"Unexpected error: {e}")
