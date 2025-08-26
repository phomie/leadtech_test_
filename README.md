# 7-Day LTV & ROAS Analysis

This SQL query calculates user revenue, campaign LTV, campaign ROAS, and top-performing countries by ROAS for the first 7 days after user installs.

---

## **Overview of the Query**

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

```sql
roas_d7 = total_revenue_d7 / total_cost_d7



## ** LeadTech Test - Backend Service**

This backend service is part of the LeadTech Test project. It consists of two Node.js servers and a Python client script to send task-specific objects.

---

## **Overview**

- `index.js` → Main backend server  
- `fakapiendpoint.js` → Fake API endpoint server  
- `sendtheobj.py` → Python script that sends objects first to `index.js` and then forwards to `fakapiendpoint.js`

**Flow:**

```text
sendtheobj.py → index.js → fakapiendpoint.js

+-----------------+        +------------+        +----------------------+
| sendtheobj.py   | -----> | index.js   | -----> | fakapiendpoint.js    |
| (Python Script) |        | (Node.js)  |        | (Node.js Fake API)   |
+-----------------+        +------------+        +----------------------+
