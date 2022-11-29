import requests

url = 'http://127.0.0.1:8080/log/1'

files = [('files', open('data.bin', 'rb'))]
resp = requests.post(url=url, files=files) 
print(resp.json())
