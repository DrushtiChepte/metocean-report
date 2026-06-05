import { Router } from "express";
import { randomUUID } from "node:crypto";
import { Location } from "../models/Location.js";
import { isDatabaseReady } from "../db.js";
import { seedLocations } from "../data/seedLocations.js";

const router = Router();

let memoryLocations = seedLocations.map((location) => ({ ...location, _id: randomUUID() }));

router.get("/", async (_request, response, next) => {
  try {
    if (isDatabaseReady()) {
      const documents = await Location.find().sort({ createdAt: 1 }).lean();
      return response.json(documents);
    }

    return response.json(memoryLocations);
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const { name, latitude, longitude, note } = request.body ?? {};

    if (!name || latitude === undefined || longitude === undefined || !note) {
      return response.status(400).json({ message: "name, latitude, longitude, and note are required" });
    }

    if (isDatabaseReady()) {
      const createdLocation = await Location.create({ name, latitude, longitude, note });
      return response.status(201).json(createdLocation);
    }

    const newLocation = {
      _id: randomUUID(),
      name,
      latitude: Number(latitude),
      longitude: Number(longitude),
      note,
    };
    memoryLocations = [...memoryLocations, newLocation];

    return response.status(201).json(newLocation);
  } catch (error) {
    return next(error);
  }
});

export default router;
