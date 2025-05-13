import requests

url = "http://127.0.0.1:8000/register/"
data = {
    "nickname": "Misha",
    "password": "3"
}

response = requests.post(url, json=data)
print(response.json())