import os
import json
import random
import string
import uuid
import requests
import datetime


def random_time ():
 iso_random = datetime.datetime.now().isoformat()
 return iso_random

def random_string():
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(10))
    return result_str

def random_value_num():
   return round(random.uniform(0, 100), 2)
def random_id():
    return str(uuid.uuid4())

def random_user_id():
    return str(uuid.uuid4())
def send_obj(random_time1,user_id,value1,campaign_id):
    obj = {}
    obj['event_id'] = str(uuid.uuid4())
    obj['user_id'] = user_id
    obj['event_name'] = "purchase"
    obj['event_time'] = random_time1
    obj['value'] = value1
    obj['campaign_id'] = campaign_id

    return obj

def main():
 random_time1=random_time()
 theresultstring=random_string()
 value1=random_value_num()
 campaign_id=random_id()
 user_id=random_user_id()
 url = "http://localhost:5001/events" 

 payload = send_obj(random_time1,user_id,value1,campaign_id)

 response = requests.post(url, json=payload) 
 print("Status:", response.status_code)
 print("Response:", response.text)

if __name__ == '__main__':
 main()
