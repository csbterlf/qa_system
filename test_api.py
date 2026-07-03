import requests
import json

url = "http://localhost:5000/ask"
data = {"question": "BERT的全称是什么？"}

response = requests.post(url, json=data)
print("状态码:", response.status_code)
print("返回结果:", response.json())