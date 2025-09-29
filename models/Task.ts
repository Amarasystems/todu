import mongoose, { Document, Schema } from 'mongoose';

export interface IChecklistItem {
  _id: string;
  label: string;
  checked: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
}

export interface ITask extends Document {
  _id: string;
  userId: string | IUser;
  title: string;
  description?: string;
  status: 'backlog' | 'in_progress' | 'done';
  order: number;
  priority: 'low' | 'med' | 'high';
  startAt?: Date;
  dueAt?: Date;
  items: IChecklistItem[];
  percent: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new Schema<IChecklistItem>(
  {
    label: {
      type: String,
      required: true,
    },
    checked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const TaskSchema = new Schema<ITask>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 120,
  },
  description: {
    type: String,
    maxlength: 2000,
  },
  status: {
    type: String,
    enum: ['backlog', 'in_progress', 'done'],
    required: true,
    index: true,
  },
  order: {
    type: Number,
    required: true,
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'med', 'high'],
    default: 'med',
  },
  startAt: {
    type: Date,
  },
  dueAt: {
    type: Date,
  },
  items: [ChecklistItemSchema],
  percent: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient querying
TaskSchema.index({ userId: 1, status: 1, order: 1 });

// Update the updatedAt field before saving
TaskSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Calculate progress based on checklist items
TaskSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    const checkedItems = this.items.filter((item) => item.checked).length;
    this.percent = Math.round((checkedItems / this.items.length) * 100);
  } else if (
    this.items &&
    this.items.length === 0 &&
    this.percent === undefined
  ) {
    // If no checklist items and percent is undefined, set to 0
    this.percent = 0;
  }
  next();
});

export default mongoose.models.Task ||
  mongoose.model<ITask>('Task', TaskSchema);
