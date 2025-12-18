import requests

url = 'http://127.0.0.1:8000/api/v1/auth/token/'
data = {'username': 'admin', 'password': 'admin123'}

try:
    r = requests.post(url, json=data, timeout=10)
    print('Status:', r.status_code)
    try:
        print('JSON:', r.json())
    except Exception as e:
        print('Response Text:', r.text)
except Exception as e:
    print('Error:', str(e))
