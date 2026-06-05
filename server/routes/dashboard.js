import { Router } from "express";
import { dashboardData } from "../data/dashboardData.js";

const router = Router();

router.get("/", (_request, response) => {
  response.json(dashboardData);
});

export default router;
