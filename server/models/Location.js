import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    note: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Location = mongoose.model("Location", locationSchema);
