import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from "sonner"
import { ArrowLeft, CheckCircle, XCircle, Clock, Eye, X, Users, IndianRupee, AlertTriangle, Loader2 } from 'lucide-react';
import { getImageUrl } from '../lib/imageUrl';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Loan {
    _id: string;
    name: string;
    fatherName: string;
    motherName: string;
    dob: string;
    signature: string;
    givingMoney: number;
    interest: number;
    amountRepaid: number;
    dueAmount: number;
    documentPhoto: string;
    termsAccepted: boolean;
    status: 'pending' | 'approved' | 'rejected';
    email: string;
    createdAt: string;
}

const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    approved: { label: 'Approved', icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
    rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewImage, setViewImage] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftInterest, setDraftInterest] = useState<string>('');
    const [draftAmountRepaid, setDraftAmountRepaid] = useState<string>('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const fetchLoans = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/loans`);
            setLoans(data);
        } catch (error) {
            setError('Failed to fetch loan applications' + error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdminLoggedIn');
        if (isAdmin !== 'true') {
            navigate('/');
            return;
        }
        fetchLoans();
    }, [navigate]);

    const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
        setUpdatingId(id);
        try {
            await axios.patch(`${API_URL}/api/loans/${id}/status`, { status });
            setLoans(prev => prev.map(l => l._id === id ? { ...l, status } : l));
        } catch (err) {
            console.error('Status update failed:', err);
            toast.error(`'Status update failed:' ${err}`)
        } finally {
            setUpdatingId(null);
        }
    };

    const startEditFinancials = (loan: Loan) => {
        setEditingId(loan._id);
        setDraftInterest(String(loan.interest));
        setDraftAmountRepaid(String(loan.amountRepaid ?? 0));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraftInterest('');
        setDraftAmountRepaid('');
    };

    const saveFinancials = async (id: string) => {
        const interestNum = Number(draftInterest);
        const amountRepaidNum = Number(draftAmountRepaid);
        if (Number.isNaN(interestNum) || Number.isNaN(amountRepaidNum) || interestNum < 0 || amountRepaidNum < 0) {
            toast.warning('Please enter valid numeric values: interest >= 0 and amount repaid >= 0');
            return;
        }

        setUpdatingId(id);
        try {
            const { data } = await axios.patch(`${API_URL}/api/loans/${id}/financials`, { interest: interestNum, amountRepaid: amountRepaidNum });
            // update local list
            setLoans(prev => prev.map(l => l._id === id ? { ...l, interest: data.loan.interest, dueAmount: data.loan.dueAmount, amountRepaid: data.loan.amountRepaid } : l));
            cancelEdit();
        } catch (err: unknown) {
            console.error('Failed to update financials:', err);
            const message = axios.isAxiosError(err)
                ? err.response?.data?.message || err.response?.data?.error
                : 'Failed to update financials (make sure backend server was restarted)';
            toast.error(message || 'Failed to update financials (make sure backend server was restarted)');
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = filter === 'all' ? loans : loans.filter(l => l.status === filter);
    const stats = {
        total: loans.length,
        pending: loans.filter(l => l.status === 'pending').length,
        approved: loans.filter(l => l.status === 'approved').length,
        rejected: loans.filter(l => l.status === 'rejected').length,
        // totalAmount: approved.reduce((s, l) => s + l.givingMoney, 0),
        totalAmount: loans.filter(l => l.status === 'approved').reduce((s, l) => s + l.givingMoney, 0),
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-blue-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Image Modal */}
            {viewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setViewImage(null)}>
                    <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewImage(null)} className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 z-10">
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                        <img src={getImageUrl(viewImage, API_URL)} alt="Document" className="w-full rounded-2xl shadow-2xl" />
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { localStorage.setItem('isAdminLoggedIn', 'false'); navigate('/'); }} className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-100">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                            <p className="text-gray-500 text-sm">Manage loan applications</p>
                        </div>
                    </div>
                    <button onClick={fetchLoans} className="px-4 py-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-100 text-sm font-medium text-gray-600">
                        Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-100"><Users className="w-5 h-5 text-blue-600" /></div>
                            <span className="text-sm text-gray-500">Total</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-amber-100"><Clock className="w-5 h-5 text-amber-600" /></div>
                            <span className="text-sm text-gray-500">Pending</span>
                        </div>
                        <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-100"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                            <span className="text-sm text-gray-500">Approved</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-100"><IndianRupee className="w-5 h-5 text-blue-600" /></div>
                            <span className="text-sm text-gray-500">Total Amount</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">₹{stats.totalAmount.toLocaleString()}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-200'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${stats[f]})`}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Loan Cards */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No applications found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(loan => {
                            const sc = statusConfig[loan.status];
                            const StatusIcon = sc.icon;
                            return (
                                <div key={loan._id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                                    <div className="p-6">
                                        {/* Top row: Name + Status */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">{loan.name}</h3>
                                                <p className="text-sm text-gray-500">{loan.email}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${sc.color}`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {sc.label}
                                            </span>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="bg-gray-50 rounded-xl p-3">
                                                <p className="text-xs text-gray-400 mb-0.5">Father / पिता</p>
                                                <p className="text-sm font-medium text-gray-700">{loan.fatherName}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-3">
                                                <p className="text-xs text-gray-400 mb-0.5">Mother / माता</p>
                                                <p className="text-sm font-medium text-gray-700">{loan.motherName}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-3">
                                                <p className="text-xs text-gray-400 mb-0.5">Date of Birth</p>
                                                <p className="text-sm font-medium text-gray-700">{new Date(loan.dob).toLocaleDateString('en-IN')}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-3">
                                                <p className="text-xs text-gray-400 mb-0.5">Applied On</p>
                                                <p className="text-sm font-medium text-gray-700">{new Date(loan.createdAt).toLocaleDateString('en-IN')}</p>
                                            </div>
                                        </div>

                                        {/* Money Details */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                                <p className="text-xs text-blue-500 mb-0.5">Loan Amount/ उधार</p>
                                                <p className="text-lg font-bold text-blue-700">₹{loan.givingMoney.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                                                <p className="text-xs text-indigo-500 mb-0.5">Interest/ ब्याज</p>
                                                {editingId === loan._id ? (
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        value={draftInterest}
                                                        onChange={e => setDraftInterest(e.target.value)}
                                                        className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-lg font-bold outline-none"
                                                    />
                                                ) : (
                                                    <p className="text-lg font-bold text-indigo-700">₹{loan.interest.toLocaleString()}</p>
                                                )}
                                            </div>
                                            <div className="max-md:col-span-2 bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                                                <p className="text-xs text-yellow-500 mb-0.5">Amount Repaid/ चुकाई गई राशि</p>
                                                {editingId === loan._id ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={draftAmountRepaid}
                                                        onChange={e => setDraftAmountRepaid(e.target.value)}
                                                        className="w-full px-3 py-2 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700 text-lg font-bold outline-none"
                                                    />
                                                ) : (
                                                    <p className="text-lg font-bold text-yellow-700">₹{(loan.amountRepaid ?? 0).toLocaleString()}</p>
                                                )}
                                            </div>
                                            <div className="max-md:col-span-2 bg-green-50 rounded-xl p-3 border border-green-100">
                                                <p className="text-xs text-green-500 mb-0.5">Due Amount/ बकाया राशि</p>
                                                <p className="text-lg font-bold text-green-700">₹{(editingId === loan._id ? Math.max(0, loan.givingMoney + Number(draftInterest || 0) - Number(draftAmountRepaid || 0)) : loan.dueAmount).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Images */}
                                        <div className="flex gap-3 mb-4">
                                            <button onClick={() => setViewImage(getImageUrl(loan.signature, API_URL))} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm text-gray-600">
                                                <Eye className="w-4 h-4" /> View Signature
                                            </button>
                                            <button onClick={() => setViewImage(getImageUrl(loan.documentPhoto, API_URL))} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm text-gray-600">
                                                <Eye className="w-4 h-4" /> View Document
                                            </button>
                                        </div>

                                        {/* Financials edit controls */}
                                        <div className="mb-4">
                                            {editingId === loan._id ? (
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => saveFinancials(loan._id)}
                                                        disabled={updatingId === loan._id}
                                                        className="px-4 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 shadow-sm disabled:opacity-50"
                                                    >
                                                        {updatingId === loan._id ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="px-4 py-2 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <button onClick={() => startEditFinancials(loan)} className="px-3 py-2 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 text-sm">
                                                        Edit Financials
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {loan.status === 'pending' && (
                                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => updateStatus(loan._id, 'approved')}
                                                    disabled={updatingId === loan._id}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-green-200 transition-all disabled:opacity-50"
                                                >
                                                    {updatingId === loan._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(loan._id, 'rejected')}
                                                    disabled={updatingId === loan._id}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-red-200 transition-all disabled:opacity-50"
                                                >
                                                    {updatingId === loan._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
