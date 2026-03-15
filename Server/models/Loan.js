const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  fatherName: {
    type: String,
    required: [true, 'Father name is required'],
    trim: true
  },
  motherName: {
    type: String,
    required: [true, 'Mother name is required'],
    trim: true
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  signature: {
    type: String,
    required: [true, 'Signature is required']
  },
  givingMoney: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [1, 'Amount must be greater than 0']
  },
  interest: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: [0, 'Interest cannot be negative']
  },
  dueAmount: {
    type: Number,
    required: true
  },
  documentPhoto: {
    type: String,
    required: [true, 'Document photo is required']
  },
  termsAccepted: {
    type: Boolean,
    required: true,
    validate: {
      validator: (val) => val === true,
      message: 'You must accept the terms and conditions'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  email: {
    type: String,
    trim: true
  },
  clerkUserId: {
    type: String
  }
}, {
  timestamps: true
});

// auto-calculate dueAmount before saving
loanSchema.pre('validate', function (next) {
  if (this.givingMoney != null && this.interest != null) {
    this.dueAmount = this.givingMoney + (this.givingMoney * this.interest / 100);
  }
  next();
});

module.exports = mongoose.model('Loan', loanSchema);
