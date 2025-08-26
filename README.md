# 7-Day LTV & ROAS Analysis

This SQL query calculates user revenue, campaign LTV, campaign ROAS, and top-performing countries by ROAS for the first 7 days after user installs.

---

## Overview of the Query

### 1. User-level revenue (`user_revenue`)
- For each user, computes total revenue from purchases in the **7 days after install** (`revenue_d7`), grouped by:
  - `user_id`
  - `campaign_id`
  - `country`
  - `install_date`

### 2. Campaign-level LTV (`campaign_ltv`)
- Calculates **average revenue per user** (`ltv_d7_per_user`) for each campaign.

### 3. Campaign revenue (`campaign_revenue`)
- Sums up total revenue (`total_revenue_d7`) for each campaign.

### 4. Campaign costs (`campaign_costs`)
- Aggregates ad costs for each campaign during the **7-day period after each install**.

### 5. Campaign ROAS (`campaign_roas`)
- Calculates **Return on Ad Spend (ROAS)** per campaign:

roas_d7 = total_revenue_d7 / total_cost_d7

---

#  Backend Service

This backend service is part of the LeadTech Test project. It consists of two Node.js servers and a Python client script to send task-specific objects.

## Overview of the Backend

### 1. Main Server (`index.js`)
- Receives objects from `sendtheobj.py`.  
- Processes the objects according to task requirements.  
- Forwards the objects to the fake API server (`fakapiendpoint.js`).  
- Logs request details, status, attempts, and latency.

### 2. Fake API Server (`fakapiendpoint.js`)
- Simulates an external API endpoint.  
- Randomly responds with:
  - 202 Accepted → object accepted  
  - 400 Invalid Payload → do not retry  
  - 429 Rate Limited → retry allowed  
  - 5xx Upstream Error → retry allowed  
- Used to test retry and idempotency behavior.

### 3. Python Client (`sendtheobj.py`)
- Sends objects to `index.js`.  
- Automatically forwards the object to `fakapiendpoint.js`.  
- Object must follow the task requirements.

## Flow Diagram

+-----------------+        +------------+        +----------------------+
| sendtheobj.py   | -----> | index.js   | -----> | fakapiendpoint.js    |
| (Python Script) |        | (Node.js)  |        | (Node.js Fake API)   |
+-----------------+        +------------+        +----------------------+


# Fullstack Test Setup

## Frontend

1. Download and install the app and dependencies of **`meine-anwendung`**.
2. Go into the **`server`** folder:
   - Initialize the packages
   - Install the dependencies
3. Open a terminal and **start the server**.
4. Open a second terminal and start the app with:
   ```bash
   npm start

5. Go into the backend folder and start the backend files in separate terminals:
   - node index.js
   - node fakeapiendpoint.js

7. Open your browser and use this URL:  

      http://localhost:3000/?utm_source=google&utm_campaign=testcampaign&utm_medium=cpc&utm_content=ad12134&click_id=12345
      
8. On the frontend:

    - Check the consent box.
    - Paste an email address into the field.
    - Push the submit button

9. Testing Notes
  - I am testing in the index.js file the origin of the request.
  - The background of my testing on origin and skipping the validation is because of different 
    types of objects on the different tasks.
  - I wasn’t sure, what the purpose was of sending differently structured objects to the fake API endpoint.
  - Now I can be sure both tasks are working. 🙂
