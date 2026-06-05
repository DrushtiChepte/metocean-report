import "dotenv/config";
import express from "express";
import cors from "cors";
import dashboardRouter from "./routes/dashboard.js";
import { dashboardData } from "./data/dashboardData.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  }),
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    locations: dashboardData.mapSites.length,
  });
});

app.use("/api/dashboard", dashboardRouter);
app.get("/api/locations", (_request, response) => {
  response.json(dashboardData.mapSites);
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
