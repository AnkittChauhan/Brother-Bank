const Loan = require('../models/Loan');
const { uploadBufferToCloudinary } = require('../utils/uploadToCloudinary');

const createLoanApplication = async (req, res) => {
    try {
        const { name, fatherName, motherName, dob, givingMoney, interest, termsAccepted, email, clerkUserId } = req.body;

        const documentFile = req.files?.documentPhoto?.[0];
        const signatureFile = req.files?.signature?.[0];

        if (!documentFile || !signatureFile) {
            return res.status(400).json({ success: false, message: 'Document photo and signature are required' });
        }

        const [documentUpload, signatureUpload] = await Promise.all([
            uploadBufferToCloudinary(documentFile.buffer, 'loan-documents/document-photo'),
            uploadBufferToCloudinary(signatureFile.buffer, 'loan-documents/signature')
        ]);

        const loan = new Loan({
            name,
            fatherName,
            motherName,
            dob,
            signature: signatureUpload.secure_url,
            givingMoney: Number(givingMoney),
            interest: Number(interest),
            documentPhoto: documentUpload.secure_url,
            termsAccepted: termsAccepted === 'true' || termsAccepted === true,
            email,
            clerkUserId
        });

        await loan.save();

        return res.status(201).json({
            success: true,
            message: 'Loan application submitted successfully',
            loan,
            uploadedImages: {
                documentPhoto: documentUpload.secure_url,
                signature: signatureUpload.secure_url
            }
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: 'Validation failed', details: messages });
        }

        console.error('Loan submission error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload documents. Please try again.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const getAllLoans = async (req, res) => {
    try {
        const loans = await Loan.find().sort({ createdAt: -1 });
        res.json(loans);
    } catch (err) {
        console.error('Fetch loans error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

const getMyLoans = async (req, res) => {
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
};

const updateFinancials = async (req, res) => {
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
};

const updateLoanStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be approved or rejected' });
        }

        const loan = await Loan.findByIdAndUpdate(req.params.id, { status }, { new: true });

        if (!loan) return res.status(404).json({ error: 'Loan not found' });

        res.json({ message: `Loan ${status}`, loan });
    } catch (err) {
        console.error('Status update error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createLoanApplication,
    getAllLoans,
    getMyLoans,
    updateFinancials,
    updateLoanStatus
};
