const express = require("express");
require("dotenv").config();
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3001; // BFF port number

app.use(cors());
app.use(express.json());

const backendBaseUrl = "http://localhost:4000"; // Your backend URL

// Middleware to add API key to backend requests
const addApiKey = async (req, res, next) => {
  req.headers["x-api-key"] = process.env.API_KEY;
  next();
};

// Function to proxy request
const proxyRequest = async (req, res, addApiKey = false) => {
  const apiKeyHeader = addApiKey ? { "x-api-key": process.env.API_KEY } : {};
  const url = `${backendBaseUrl}${req.originalUrl}`;
  try {
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: { ...apiKeyHeader },
    });
    res.send(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || "Error");
  }
};

// Routes that require API key
app.get("/user/policies/all", (req, res) => proxyRequest(req, res, true));
app.post("/user/policies/select", (req, res) => proxyRequest(req, res, true));
app.post("/user/:userId/policies/select", (req, res) =>
  proxyRequest(req, res, true)
);
app.get("/user/policies/:policyId", (req, res) => proxyRequest(req, res, true));
app.post("/user/claims/create", (req, res) => proxyRequest(req, res, true));
app.get("/user/:userId/claims/history", (req, res) =>
  proxyRequest(req, res, true)
);

app.post("/admin/policies/add", (req, res) => proxyRequest(req, res, true));
app.get("/admin/policies/all", (req, res) => proxyRequest(req, res, true));
app.patch("/admin/policies/:id", (req, res) => proxyRequest(req, res, true));
app.delete("/admin/policies/:id", (req, res) => proxyRequest(req, res, true));
app.get("/admin/claims/pending", (req, res) => proxyRequest(req, res, true));
app.patch("/admin/claims/:claimId/approve", (req, res) =>
  proxyRequest(req, res, true)
);

app.get("/admin/claims/approved", (req, res) => proxyRequest(req, res, true));
app.patch("/admin/claims/:claimId/reject", (req, res) =>
  proxyRequest(req, res, true)
);

app.get("/admin/claims/rejected", (req, res) => proxyRequest(req, res, true));
app.get("/admin/listusers", (req, res) => proxyRequest(req, res, true));
app.get("/admin/listadmins", (req, res) => proxyRequest(req, res, true));
app.delete("/admin/users/:userId", (req, res) => proxyRequest(req, res, true));

// Routes that do not require API key
app.post("/user/register", (req, res) => proxyRequest(req, res));
app.post("/user/login", (req, res) => proxyRequest(req, res));
app.post("/admin/register", (req, res) => proxyRequest(req, res));
app.post("/admin/login", (req, res) => proxyRequest(req, res));

app.listen(PORT, () => {
  console.log(`BFF running on http://localhost:${PORT}`);
});
