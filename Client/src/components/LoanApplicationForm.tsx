import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Upload, FileCheck, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MAX_FILE_SIZE = 7 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const TERMS_TEXT = {
    en: `By checking this box, I hereby confirm and agree to the following terms and conditions:

1. I acknowledge that the loan amount specified above will be provided to me by Brother Bank.
2. I agree to repay the full due amount (principal + interest) within the agreed repayment period.
3. I confirm that all information provided in this application is true, accurate, and complete to the best of my knowledge.
4. I understand that providing false or misleading information may result in the rejection of my application or legal action.
5. I agree that the uploaded documents will be used for verification purposes only.
6. I understand that failure to repay the loan on time may result in additional penalties or legal proceedings.
7. I accept that Brother Bank reserves the right to approve or reject my loan application at its discretion.`,

    hi: `इस बॉक्स को चेक करके, मैं निम्नलिखित नियम और शर्तों की पुष्टि करता/करती हूँ और उनसे सहमत होता/होती हूँ:

1. मैं स्वीकार करता/करती हूँ कि ऊपर उल्लिखित ऋण राशि मुझे ब्रदर बैंक द्वारा प्रदान की जाएगी।
2. मैं सहमत हूँ कि मैं पूरी देय राशि (मूलधन + ब्याज) को सहमत अवधि के भीतर चुकाऊँगा/चुकाऊँगी।
3. मैं पुष्टि करता/करती हूँ कि इस आवेदन में दी गई सभी जानकारी मेरी जानकारी के अनुसार सत्य, सटीक और पूर्ण है।
4. मैं समझता/समझती हूँ कि गलत या भ्रामक जानकारी देने पर मेरा आवेदन अस्वीकार हो सकता है या कानूनी कार्रवाई हो सकती है।
5. मैं सहमत हूँ कि अपलोड किए गए दस्तावेज़ केवल सत्यापन उद्देश्यों के लिए उपयोग किए जाएंगे।
6. मैं समझता/समझती हूँ कि समय पर ऋण न चुकाने पर अतिरिक्त जुर्माना या कानूनी कार्यवाही हो सकती है।
7. मैं स्वीकार करता/करती हूँ कि ब्रदर बैंक को अपने विवेक से मेरे ऋण आवेदन को स्वीकार या अस्वीकार करने का अधिकार है।`
};

interface FormData {
    name: string;
    fatherName: string;
    motherName: string;
    dob: string;
    givingMoney: number;
    interest: number;
    termsAccepted: boolean;
}

interface FormErrors {
    [key: string]: string;
}

const LoanApplicationForm = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<FormData>({
        name: '',
        fatherName: '',
        motherName: '',
        dob: '',
        givingMoney: 0,
        interest: 0,
        termsAccepted: false,
    });
    const [documentPhoto, setDocumentPhoto] = useState<File | null>(null);
    const [signature, setSignature] = useState<File | null>(null);
    const [docPreview, setDocPreview] = useState<string>('');
    const [sigPreview, setSigPreview] = useState<string>('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [termsLang, setTermsLang] = useState<'en' | 'hi'>('en');

    const dueAmount = formData.givingMoney + formData.interest;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const isNumericField = name === 'givingMoney' || name === 'interest';
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : isNumericField ? Number(value) : value,
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'documentPhoto' | 'signature') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            const message = 'Only image files (jpeg, jpg, png, webp) are allowed.';
            setErrors(prev => ({ ...prev, [field]: message }));
            toast.error(message);
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            const message = 'File size exceeds 7MB limit.';
            setErrors(prev => ({ ...prev, [field]: message }));
            toast.error(message);
            return;
        }

        if (field === 'documentPhoto') {
            if (docPreview) URL.revokeObjectURL(docPreview);
            setDocumentPhoto(file);
            setDocPreview(URL.createObjectURL(file));
        } else {
            if (sigPreview) URL.revokeObjectURL(sigPreview);
            setSignature(file);
            setSigPreview(URL.createObjectURL(file));
        }
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // cleanup previews
    useEffect(() => {
        return () => {
            if (docPreview) URL.revokeObjectURL(docPreview);
            if (sigPreview) URL.revokeObjectURL(sigPreview);
        };
    }, [docPreview, sigPreview]);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.fatherName.trim()) newErrors.fatherName = 'Father name is required';
        if (!formData.motherName.trim()) newErrors.motherName = 'Mother name is required';
        if (!formData.dob) newErrors.dob = 'Date of birth is required';
        if (!formData.givingMoney || formData.givingMoney <= 0) newErrors.givingMoney = 'Valid amount is required';
        if (formData.interest < 0) newErrors.interest = 'Valid interest amount is required';
        if (!documentPhoto) newErrors.documentPhoto = 'Document photo is required';
        if (!signature) newErrors.signature = 'Signature is required';
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const token = await getToken();
            const data = new FormData();
            data.append('name', formData.name);
            data.append('fatherName', formData.fatherName);
            data.append('motherName', formData.motherName);
            data.append('dob', formData.dob);
            data.append('givingMoney', String(formData.givingMoney));
            data.append('interest', String(formData.interest));
            data.append('termsAccepted', 'true');
            data.append('email', user?.primaryEmailAddress?.emailAddress || '');
            data.append('clerkUserId', user?.id || '');
            if (documentPhoto) data.append('documentPhoto', documentPhoto);
            if (signature) data.append('signature', signature);

            await axios.post(`${API_URL}/api/loans`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Application submitted successfully!');
            setSubmitSuccess(true);
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.message || err.response?.data?.error || err.response?.data?.details?.join(', ') || 'Failed to submit application'
                : 'Failed to submit application';
            setSubmitError(msg);
                toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-blue-50 p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center space-y-6 border border-green-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Application Submitted!</h2>
                    <p className="text-gray-500">Your loan application has been submitted successfully. The admin will review it shortly.</p>
                    <p className="text-gray-500">आपका ऋण आवेदन सफलतापूर्वक जमा हो गया है। प्रशासक शीघ्र ही इसकी समीक्षा करेंगे।</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-200"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Loan Application</h1>
                        <p className="text-gray-500 text-sm">ऋण आवेदन पत्र</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Details Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-5">
                        <h2 className="text-lg font-semibold text-gray-700 border-b border-gray-100 pb-3">
                            Personal Details / व्यक्तिगत विवरण
                        </h2>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full Name / पूरा नाम <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                        </div>

                        {/* Father & Mother */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Father's Name / पिता का नाम <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fatherName"
                                    value={formData.fatherName}
                                    onChange={handleChange}
                                    placeholder="Father's name"
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.fatherName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                />
                                {errors.fatherName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fatherName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Mother's Name / माता का नाम <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="motherName"
                                    value={formData.motherName}
                                    onChange={handleChange}
                                    placeholder="Mother's name"
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.motherName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                />
                                {errors.motherName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.motherName}</p>}
                            </div>
                        </div>

                        {/* DOB */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Date of Birth / जन्म तिथि <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-xl border ${errors.dob ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                            />
                            {errors.dob && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.dob}</p>}
                        </div>
                    </div>

                    {/* Loan Details Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-5">
                        <h2 className="text-lg font-semibold text-gray-700 border-b border-gray-100 pb-3">
                            Loan Details / ऋण विवरण
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Loan Money (₹) / दी जाने वाली राशि <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="givingMoney"
                                    value={formData.givingMoney}
                                    onChange={handleChange}
                                    placeholder="e.g. 50000"
                                    min="1"
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.givingMoney ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                />
                                {errors.givingMoney && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.givingMoney}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Interest (₹) / ब्याज राशि <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="interest"
                                    value={formData.interest}
                                    onChange={handleChange}
                                    placeholder="e.g. 5000"
                                    min="0"
                                    step="0.1"
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.interest ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                />
                                {errors.interest && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.interest}</p>}
                            </div>
                        </div>

                        {/* Due Amount */}
                        <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                            <p className="text-sm text-gray-500 mb-1">Due Amount / देय राशि</p>
                            <p className="text-3xl font-bold text-blue-700">₹{dueAmount.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-gray-400 mt-1">Principal + Interest / मूलधन + ब्याज</p>
                        </div>
                    </div>

                    {/* Documents Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-5">
                        <h2 className="text-lg font-semibold text-gray-700 border-b border-gray-100 pb-3">
                            Documents / दस्तावेज़
                        </h2>

                        {/* Signature Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Signature / हस्ताक्षर <span className="text-red-500">*</span>
                            </label>
                            <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 ${errors.signature ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'signature')} className="hidden" id="signature-upload" />
                                <label htmlFor="signature-upload" className="cursor-pointer">
                                    {sigPreview ? (
                                        <div className="space-y-2">
                                            <img src={sigPreview} alt="Signature preview" className="max-h-24 mx-auto rounded-lg" />
                                            <p className="text-xs text-gray-500">{signature?.name}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 py-2">
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                                            <p className="text-sm text-gray-500">Upload signature image</p>
                                            <p className="text-xs text-gray-400">JPG, PNG or WebP (max 7MB)</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                            {errors.signature && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.signature}</p>}
                        </div>

                        {/* Document Photo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Document Photo / दस्तावेज़ फ़ोटो <span className="text-red-500">*</span>
                            </label>
                            <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 ${errors.documentPhoto ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'documentPhoto')} className="hidden" id="doc-upload" />
                                <label htmlFor="doc-upload" className="cursor-pointer">
                                    {docPreview ? (
                                        <div className="space-y-2">
                                            <img src={docPreview} alt="Document preview" className="max-h-32 mx-auto rounded-lg shadow-sm" />
                                            <p className="text-xs text-gray-500">{documentPhoto?.name}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 py-4">
                                            <Upload className="w-10 h-10 text-gray-400 mx-auto" />
                                            <p className="text-sm text-gray-500">Click to upload document photo</p>
                                            <p className="text-xs text-gray-400">JPG, PNG or WebP (max 7MB)</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                            {errors.documentPhoto && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.documentPhoto}</p>}
                        </div>
                    </div>

                    {/* Terms & Conditions Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h2 className="text-lg font-semibold text-gray-700">
                                Terms & Conditions / नियम और शर्तें
                            </h2>
                            <div className="flex bg-gray-100 rounded-lg p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setTermsLang('en')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${termsLang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                                >
                                    English
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTermsLang('hi')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${termsLang === 'hi' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                                >
                                    हिंदी
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto text-sm text-gray-600 leading-relaxed whitespace-pre-line border border-gray-100">
                            {TERMS_TEXT[termsLang]}
                        </div>

                        <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.termsAccepted ? 'border-blue-200 bg-blue-50' : errors.termsAccepted ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-blue-200'}`}>
                            <input
                                type="checkbox"
                                name="termsAccepted"
                                checked={formData.termsAccepted}
                                onChange={handleChange}
                                className="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700">
                                    I accept all terms and conditions
                                </span>
                                <br />
                                <span className="text-xs text-gray-500">
                                    मैं सभी नियम और शर्तें स्वीकार करता/करती हूँ
                                </span>
                            </div>
                        </label>
                        {errors.termsAccepted && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.termsAccepted}</p>}
                    </div>

                    {/* Submit Error */}
                    {submitError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-700">{submitError}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-lg"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <FileCheck className="w-5 h-5" />
                                Submit Application / आवेदन जमा करें
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoanApplicationForm;
