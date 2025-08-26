import express from "express";

const app = express();
app.use(express.json());

app.post("/v1/conversions", (req, res) => {
  // console.log("req.headers:", req.headers);
  // console.log("req.body:", req.body);

  if (req.body) {
    const response = {
      status: "accepted",
      received_at: new Date().toISOString(),
    };

    return res.status(202).json(response);
  } else {
    return res.status(400).json({ error: "no body received" });
  }
});
app.get("/v1/conversions", (req, res) => {
  res.json({ message: "Use POST to send conversions" });
});
app.use((req, res) => {
  res.status(404).json({ error: "not_found" });
});

const PORT = 5003;
app.listen(PORT, () => {
  console.log(`Fake API running at http://localhost:${PORT}`);
});
