import mongoose, { Schema } from "mongoose"; 

const WitnessSchema = new mongoose.Schema({
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
    witnessName: { type: String, required: true },
    statement: { type: String, required: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Officer" },
    recordedAt: { type: String },
  });
  
export const Witness = mongoose.model("Witness", WitnessSchema);
  
