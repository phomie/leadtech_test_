DROP TABLE IF EXISTS `testpurpose.purchases`;
CREATE TABLE `testpurpose.purchases` (
  user_id STRING,
  event_ts TIMESTAMP,
  value FLOAT64
);

INSERT INTO `testpurpose.purchases` (user_id, event_ts, value)
VALUES
  ('u1', TIMESTAMP("2025-08-01 12:00:00"), 9.99),
  ('u1', TIMESTAMP("2025-08-02 14:00:00"), 19.99),
  ('u2', TIMESTAMP("2025-08-02 10:30:00"), 4.99),
  ('u3', TIMESTAMP("2025-08-03 18:15:00"), 29.99),
  ('u4', TIMESTAMP("2025-08-04 20:00:00"), 18.99),
  ('u5', TIMESTAMP("2025-08-05 20:00:00"), 17.99),
  ('u6', TIMESTAMP("2025-08-06 20:00:00"), 16.99),
  ('u7', TIMESTAMP("2025-08-07 20:00:00"), 16.99),
  ('u8', TIMESTAMP("2025-08-08 20:00:00"), 155.99),
  ('u9', TIMESTAMP("2025-08-09 20:00:00"), 1.99),
  ('u10', TIMESTAMP("2025-08-10 20:00:00"), 12.99);


CREATE OR REPLACE TABLE `testpurpose.installs` (
  user_id STRING,
  install_ts TIMESTAMP,
  campaign_id STRING,
  country STRING
);

INSERT INTO `testpurpose.installs` (user_id, install_ts, campaign_id, country)
VALUES
  ('u1', TIMESTAMP("2025-08-01 09:00:00"), 'c1', 'US'),
  ('u2', TIMESTAMP("2025-08-01 10:15:00"), 'c2', 'DE'),
  ('u3', TIMESTAMP("2025-08-01 11:30:00"), 'c1', 'US'),
  ('u4', TIMESTAMP("2025-08-02 08:45:00"), 'c3', 'FR'),
  ('u5', TIMESTAMP("2025-08-02 14:20:00"), 'c2', 'IN'),
  ('u6', TIMESTAMP("2025-08-02 18:05:00"), 'c1', 'BR'),
  ('u7', TIMESTAMP("2025-08-03 09:10:00"), 'c3', 'UK'),
  ('u8', TIMESTAMP("2025-08-03 12:40:00"), 'c2', 'CA'),
  ('u9', TIMESTAMP("2025-08-04 16:00:00"), 'c1', 'US'),
  ('u10', TIMESTAMP("2025-08-04 19:30:00"), 'c3', 'JP');


CREATE OR REPLACE TABLE `testpurpose.ad_costs` (
  campaign_id STRING,
  date DATE,
  cost FLOAT64
);

-- Insert 10 rows
INSERT INTO `testpurpose.ad_costs` (campaign_id, date, cost)
VALUES
  ('c1', DATE("2025-08-01"), 100.00),
  ('c2', DATE("2025-08-01"), 80.00),
  ('c1', DATE("2025-08-02"), 120.00),
  ('c3', DATE("2025-08-02"), 95.00),
  ('c2', DATE("2025-08-02"), 60.00),
  ('c1', DATE("2025-08-03"), 150.00),
  ('c2', DATE("2025-08-03"), 90.00),
  ('c3', DATE("2025-08-03"), 110.00),
  ('c1', DATE("2025-08-04"), 130.00),
  ('c3', DATE("2025-08-04"), 140.00);


  WITH user_revenue AS (
  SELECT
    i.user_id,
    i.campaign_id,
    i.country,
    DATE(i.install_ts) AS install_date,
    SUM(p.value) AS revenue_d7
  FROM `testpurpose.installs` i
  LEFT JOIN `testpurpose.purchases` p
    ON i.user_id = p.user_id
   AND p.event_ts BETWEEN i.install_ts AND TIMESTAMP_ADD(i.install_ts, INTERVAL 7 DAY)
  GROUP BY i.user_id, i.campaign_id, i.country, install_date
),

campaign_ltv AS (
  SELECT
    campaign_id,
    AVG(revenue_d7) AS ltv_d7_per_user
  FROM user_revenue
  GROUP BY campaign_id
),

campaign_revenue AS (
  SELECT
    campaign_id,
    SUM(revenue_d7) AS total_revenue_d7
  FROM user_revenue
  GROUP BY campaign_id
),

campaign_costs AS (
  SELECT
    i.campaign_id,
    SUM(c.cost) AS total_cost_d7
  FROM `testpurpose.installs` i
  JOIN `testpurpose.ad_costs` c
    ON i.campaign_id = c.campaign_id
   AND c.date BETWEEN DATE(i.install_ts) AND DATE_ADD(DATE(i.install_ts), INTERVAL 7 DAY)
  GROUP BY i.campaign_id
),

campaign_roas AS (
  SELECT
    r.campaign_id,
    r.total_revenue_d7,
    c.total_cost_d7,
    SAFE_DIVIDE(r.total_revenue_d7, c.total_cost_d7) AS roas_d7
  FROM campaign_revenue r
  JOIN campaign_costs c USING(campaign_id)
),

country_roas AS (
  -- Attribute campaign-level costs to countries proportionally by revenue
  SELECT
    u.country,
    u.campaign_id,
    SUM(u.revenue_d7) AS revenue_d7,
    SUM(u.revenue_d7) / NULLIF(r.total_revenue_d7,0) * r.total_cost_d7 AS allocated_cost_d7,
    SAFE_DIVIDE(SUM(u.revenue_d7),
                SUM(u.revenue_d7) / NULLIF(r.total_revenue_d7,0) * r.total_cost_d7) AS roas_d7
  FROM user_revenue u
  JOIN campaign_roas r USING(campaign_id)
  GROUP BY u.country, u.campaign_id, r.total_revenue_d7, r.total_cost_d7
)

-- Final outputs
SELECT
  'LTV D7 per campaign' AS metric,
  campaign_id,
  ltv_d7_per_user AS value
FROM campaign_ltv

UNION ALL

SELECT
  'ROAS D7 per campaign',
  campaign_id,
  roas_d7
FROM campaign_roas

UNION ALL

SELECT
  'Top 3 Countries by ROAS D7',
  country,
  roas_d7
FROM (
  SELECT country, roas_d7,
         ROW_NUMBER() OVER (ORDER BY roas_d7 DESC) AS rn
  FROM country_roas
)
WHERE rn <= 3;