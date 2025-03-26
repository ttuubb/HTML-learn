import mongoose, { Schema, Document } from 'mongoose';

interface ICourse extends Document {
  title: string;
  description: string;
  content: string;
  author: mongoose.Types.ObjectId;
  knowledgePoints: mongoose.Types.ObjectId[];
  quizzes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  knowledgePoints: [{ type: Schema.Types.ObjectId, ref: 'KnowledgePoint' }],
  quizzes: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CourseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ICourse>('Course', CourseSchema);