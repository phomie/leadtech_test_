import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
import { v4 as uuidv4 } from "uuid";

app.post("/v1/conversions", async (req, res) => {
  //console.log("req.headers:", req.headers);
  console.log("req.bodwerwery:", req.body);
  const payload = req.body;
  const transformed = {
    event_id: uuidv4(),
    event_name: "lead",
    event_time: new Date().toISOString(),
    value: 0,
    campaign_id: payload.utm_campaign || "",
    source: payload.utm_source || "",
    click_id: payload.click_id || "",
  };
  console.log("transformed:", transformed);

  const API_URL = "http://localhost:5001/events";
  const API_KEY = "YOUR_API_KEY";
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY,
      },
      body: JSON.stringify(transformed),
    });
  } catch (error) {
    console.error(error);
  }
});

const PORT = 5004;
app.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
