import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
import { v4 as uuidv4 } from "uuid";

app.post("/v1/conversions", async (req, res) => {
  //console.log("req.headers:", req.headers);
  console.log("reqbodyfromeserver", req.body);
  const payload = req.body;

  const transformed = {
    event_id: uuidv4(),
    user_id: payload.email,
    event_name: "lead",
    event_time: new Date().toISOString(),
    value: 0,
    campaign_id: payload.utm_campaign || "",
    source: payload.utm_source || "",
    click_id: payload.click_id || "",
  };
  console.log("transformed from server:", transformed);

  const API_URL = "http://localhost:5001/events";
  const API_KEY = "YOUR_API_KEY";
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY,
        "Origin": "http://localhost:3000",
      },
      body: JSON.stringify(transformed),
    });
    if (response.status === 202) {
      console.log("202 response received");
      const responseData = await response.json();
      return res.status(202).json(responseData);}
  } catch (error) {
    console.error(error);
  }
});

const PORT = 5004;
app.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
