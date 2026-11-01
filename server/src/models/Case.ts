import mongoose, { Schema, Document } from 'mongoose';
import { ICase, ISuspect, IClue, IHint, ISecretSolution } from '../types/case.types.js';

export interface ICaseDocument extends ICase, Document {}

const SuspectSchema = new Schema<ISuspect>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    motive: { type: String, required: true },
    alibi: { type: String, required: true },
    occupation: { type: String },
  },
  { _id: false }
);

const ClueSchema = new Schema<IClue>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Physical', 'Document', 'Forensics', 'Witness', 'Digital'],
      required: true,
    },
    significance: { type: String, required: true },
  },
  { _id: false }
);

const HintSchema = new Schema<IHint>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const SecretSolutionSchema = new Schema<ISecretSolution>(
  {
    culpritId: { type: String, required: true },
    culpritName: { type: String, required: true },
    explanation: { type: String, required: true },
    evidenceReasoning: { type: [String], required: true },
  },
  { _id: false }
);

const CaseSchema = new Schema<ICaseDocument>(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    caseTokenHash: {
      type: String,
      required: true,
      index: true,
      // Critical security rule: prevent accidental leak in default queries
      select: false,
    },
    title: { type: String, required: true },
    premise: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
      index: true,
    },
    theme: { type: String, default: 'Classic Noir' },
    story: { type: String, required: true },
    suspects: {
      type: [SuspectSchema],
      required: true,
    },
    clues: {
      type: [ClueSchema],
      required: true,
    },
    hints: {
      type: [HintSchema],
      required: true,
    },
    secretSolution: {
      type: SecretSolutionSchema,
      required: true,
      // Critical security rule: excluded by default to guarantee zero-leakage to active case clients
      select: false,
    },
    discoveredClueIds: {
      type: [String],
      default: [],
    },
    revealedHintCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
      index: true,
    },
    selectedSuspectId: { type: String },
    isCorrect: { type: Boolean },
    finalScore: { type: Number },
  },
  {
    timestamps: true,
  }
);

export const Case = mongoose.model<ICaseDocument>('Case', CaseSchema);
