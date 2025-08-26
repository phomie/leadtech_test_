import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import { useEffect } from "react";
import axiosInstance from "./axios";

function App() {
  const [formData, setFormData] = useState({
    email: "",
    consent: false,
    utm_source: "",
    utm_campaign: "",
    utm_medium: "",
    utm_content: "",
    click_id: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFormData((prev) => ({
      ...prev,
      utm_source: params.get("utm_source") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_content: params.get("utm_content") || "",
      click_id: params.get("click_id") || "",
    }));
  }, []);

  const handleSubmit = (event) => {
    console.log("✌️event --->", event);
    event.preventDefault();
    const data = new FormData(event.target);
    console.log("✌️data --->", data);
    const payload = {
      email: data.get("email"),
      consent: data.get("consent") === "on",
      utm_source: data.get("utm_source"),
      utm_campaign: data.get("utm_campaign"),
      utm_medium: data.get("utm_medium"),
      utm_content: data.get("utm_content"),
      click_id: data.get("click_id"),
    };

    localStorage.setItem("formData", JSON.stringify(payload));
    console.log("payload --->", payload);

    axiosInstance
      .post("/v1/conversions", payload)
      .then((res) => console.log("Suc:", res.data))
      .catch((err) => console.error("Err:", err));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };
  return (
    <div className="App">
      <form onSubmit={handleSubmit} autoComplete="off">
        <label>
          Consent:
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email:
          <input type="email" name="email" onChange={handleChange} required />
        </label>
        <button type="submit">Submit</button>
        <input type="hidden" name="utm_source" value={formData.utm_source} />
        <input
          type="hidden"
          name="utm_campaign"
          value={formData.utm_campaign}
        />
        <input type="hidden" name="utm_medium" value={formData.utm_medium} />
        <input type="hidden" name="utm_content" value={formData.utm_content} />
        <input type="hidden" name="click_id" value={formData.click_id} />
      </form>
    </div>
  );
}

export default App;
