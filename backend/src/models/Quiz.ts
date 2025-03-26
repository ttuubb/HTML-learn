import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  questions: Array<{
    type: 'single' | 'multiple' | 'text';
    content: string;
    options?: Array<{
      id: string;
      content: string;
    }>;
    correctAnswer: string | string[];
    explanation?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String },
  questions: [{
    type: { type: String, enum: ['single', 'multiple', 'text'], required: true },
    content: { type: String, required: true },
    options: [{
      id: { type: String, required: true },
      content: { type: String, required: true },
    }],
    correctAnswer: { type: Schema.Types.Mixed, required: true },
    explanation: { type: String },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

QuizSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema);