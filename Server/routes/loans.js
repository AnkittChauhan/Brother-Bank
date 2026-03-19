const express = require('express');
const { uploadLoanDocuments } = require('../middleware/upload');
const {
    createLoanApplication,
    getAllLoans,
    getMyLoans,
    updateFinancials,
    updateLoanStatus
} = require('../controllers/loanController');

const router = express.Router();

// POST /api/loans — submit a new loan application
router.post(
    '/',
    uploadLoanDocuments,
    createLoanApplication
);

// GET /api/loans — get all loan applications (for admin)
router.get('/', getAllLoans);

// GET /api/loans/my?userId=<clerkUserId> — get current user's loans
router.get('/my', getMyLoans);

// PATCH /api/loans/:id/financials — update interest and dueAmount (admin)
router.patch('/:id/financials', updateFinancials);

// PATCH /api/loans/:id/status — approve or reject a loan
router.patch('/:id/status', updateLoanStatus);

module.exports = router;
