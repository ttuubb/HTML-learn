import mongoose, { Schema, Document } from 'mongoose';

export interface IKnowledgePoint extends Document {
  title: string;
  theory: string;
  codeExample?: string;
  demoConfig?: {
    type: 'code' | 'visualization';
    content: {
      initialCode?: string;
      finalCode?: string;
      steps?: Array<{
        description: string;
        code?: string;
        visualization?: string;
      }>;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgePointSchema: Schema = new Schema({
  title: { type: String, required: true },
  theory: { type: String, required: true },
  codeExample: { type: String },
  demoConfig: {
    type: {
      type: String,
      enum: ['code', 'visualization'],
    },
    content: {
      initialCode: String,
      finalCode: String,
      steps: [{
        description: String,
        code: String,
        visualization: String,
      }],
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

KnowledgePointSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IKnowledgePoint>('KnowledgePoint', KnowledgePointSchema);