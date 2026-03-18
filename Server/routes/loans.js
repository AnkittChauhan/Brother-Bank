const express = require('express');
const multer = require('multer');
const path = require('path');
const Loan = require('../models/Loan');

const router = express.Router();

// multer config — save uploads to /uploads with unique filenames
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype.split('/')[1]);
        if (ext && mime) return cb(null, true);
        cb(new Error('Only image files (jpg, png, webp) are allowed'));
    }
});

// POST /api/loans — submit a new loan application
router.post(
    '/',
    upload.fields([
        { name: 'documentPhoto', maxCount: 1 },
        { name: 'signature', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { name, fatherName, motherName, dob, givingMoney, interest, termsAccepted, email, clerkUserId } = req.body;

            if (!req.files?.documentPhoto?.[0] || !req.files?.signature?.[0]) {
                return res.status(400).json({ error: 'Document photo and signature are required' });
            }

            const loan = new Loan({
                name,
                fatherName,
                motherName,
                dob,
                signature: '/uploads/' + req.files.signature[0].filename,
                givingMoney: Number(givingMoney),
                interest: Number(interest),
                documentPhoto: '/uploads/' + req.files.documentPhoto[0].filename,
                termsAccepted: termsAccepted === 'true' || termsAccepted === true,
                email,
                clerkUserId
            });

            await loan.save();
            res.status(201).json({ message: 'Loan application submitted successfully', loan });
        } catch (err) {
            if (err.name === 'ValidationError') {
                const messages = Object.values(err.errors).map(e => e.message);
                return res.status(400).json({ error: 'Validation failed', details: messages });
            }
            console.error('Loan submission error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// GET /api/loans — get all loan applications (for admin)
router.get('/', async (req, res) => {
    try {
        const loans = await Loan.find().sort({ createdAt: -1 });
        res.json(loans);
    } catch (err) {
        console.error('Fetch loans error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/loans/my?userId=<clerkUserId> — get current user's loans
router.get('/my', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId query parameter is required' });
        }

        const loans = await Loan.find({ clerkUserId: userId }).sort({ createdAt: -1 });
        res.json(loans);
    } catch (err) {
        console.error('Fetch my loans error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/loans/:id/financials — update interest and dueAmount (admin)
router.patch('/:id/financials', async (req, res) => {
    try {
        const { interest, dueAmount } = req.body;

        if (interest == null || dueAmount == null) {
            return res.status(400).json({ error: 'interest and dueAmount are required' });
        }

        const interestNum = Number(interest);
        const dueAmountNum = Number(dueAmount);

        if (Number.isNaN(interestNum) || Number.isNaN(dueAmountNum)) {
            return res.status(400).json({ error: 'interest and dueAmount must be numeric' });
        }

        if (interestNum < 0) return res.status(400).json({ error: 'interest cannot be negative' });
        if (dueAmountNum <= 0) return res.status(400).json({ error: 'dueAmount must be greater than 0' });

        const loan = await Loan.findByIdAndUpdate(
            req.params.id,
            { interest: interestNum, dueAmount: dueAmountNum },
            { new: true }
        );

        if (!loan) return res.status(404).json({ error: 'Loan not found' });

        res.json({ message: 'Financials updated', loan });
    } catch (err) {
        console.error('Financials update error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/loans/:id/status — approve or reject a loan
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be approved or rejected' });
        }

        const loan = await Loan.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!loan) return res.status(404).json({ error: 'Loan not found' });

        res.json({ message: `Loan ${status}`, loan });
    } catch (err) {
        console.error('Status update error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
