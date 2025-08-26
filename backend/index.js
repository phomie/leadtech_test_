const express = require("express");
const app = express();
const cors = require("cors");
//const multer = require("multer");
const path = require("path");
const corsOptions = {};
app.use(cors());
app.use(express.json());
const fetch = require("node-fetch");

app.use(
  express.urlencoded({
    extended: true,
  })
);
function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    str
  );
}
app.use(express.static(path.join(__dirname, "public")));

app.post("/events", async (req, res) => {
  const origin = req.get("Origin"); // cross-origin
  console.log("Origin header:", origin);

  const payload = req.body;
  console.log("request body of index.js:", req.body);
  if(origin !== "http://localhost:3000"){
    

  const requiredFields = [
    "id",
    "user_id",
    "event_name",
    "event_time",
    "value",
    "campaign_id",
  ];
  if (
    !isValidUUID(payload.event_id) ||
    !isValidUUID(payload.user_id) ||
    !isValidUUID(payload.campaign_id)
  ) {
    return res
      .status(400)
      .json({ error: "Invalid UUID in id, user_id or campaign_id" });
  }
  if (!["purchase", "lead"].includes(payload.event_name)) {
    return res
      .status(400)
      .json({ error: "Invalid event_name, must be 'purchase' or 'lead'" });
  }

  if (isNaN(Date.parse(payload.event_time))) {
    return res
      .status(400)
      .json({ error: "Invalid event_time, must be ISO-8601 string" });
  }
  if (typeof payload.value !== "number") {
    return res.status(400).json({ error: "value must be a number" });
  }

  }
  const transformed = {
    id: payload.event_id,
    user: payload.user_id,
    name: payload.event_name,
    ts: Math.floor(new Date(payload.event_time).getTime() / 1000),
    value_cents: Math.round(payload.value * 100),
    campaign: payload.campaign_id,
    source: "internal martech",
  };

console.log("Transew:", transformed);
  const API_URL = "http://localhost:5003/v1/conversions";
  const API_KEY = "YOUR_API_KEY";
  let attempts = 0;
  let success = false;
  let responseData = null;
  const start = Date.now();

  while (attempts < 3 && !success) {
    attempts++;
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": API_KEY,
        },
        body: JSON.stringify(transformed),
      });

      if (response.status === 202) {
        console.log("202 response received");
        success = true;
        responseData = await response.json();
        const latency = Date.now() - start;
        console.log({
          request_id: payload.event_id,
          status: responseData?.status || responseData?.error || "unknown",
          attempts,
          latency: `${latency}ms`,
        });

        return res
          .status(success ? 202 : responseData?.status || 500)
          .json(responseData);
      } else if (response.status === 429 || response.status >= 500) {
        const delay = Math.pow(2, attempts) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        responseData = await response.json();
        const latency = Date.now() - start;
        console.log({
          request_id: payload.event_id,
          status: responseData?.status || responseData?.error || "unknown",
          attempts,
          latency: `${latency}ms`,
        });

        return res
          .status(success ? 202 : responseData?.status || 500)
          .json(responseData);
        break;
      }
    } catch (err) {
      console.error("Request error:", err);
    }
  }
});
app.use((req, res) => {
  res.status(404).json({ error: "not_found" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
