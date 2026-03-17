import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Receipt,
  User,
  X,
  XCircle,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Loan {
  _id: string;
  name: string;
  signature: string;
  givingMoney: number;
  interest: number;
  dueAmount: number;
  documentPhoto: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'bg-red-100 text-red-700 border-red-200',
  },
};

const MyLoans = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewImage, setViewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyLoans = async () => {
      if (!isLoaded) return;

      if (!user?.id) {
        setLoading(false);
        setError('Please sign in to view your loans.');
        return;
      }

      try {
        const { data } = await axios.get(`${API_URL}/api/loans/my`, {
          params: { userId: user.id },
        });
        setLoans(data);
      } catch (err: unknown) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || 'Failed to fetch your loans. Please try again.'
          : 'Failed to fetch your loans. Please try again.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyLoans();
  }, [isLoaded, user?.id]);

  if (loading || !isLoaded) {
    return (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-blue-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      {viewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setViewImage(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setViewImage(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 z-10"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <img src={`${API_URL}${viewImage}`} alt="Uploaded document" className="w-full rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Loans</h1>
            <p className="text-gray-500 text-sm">Track your submitted loan applications</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
        )}

        {loans.length === 0 && !error ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center space-y-4">
            <Receipt className="w-10 h-10 text-gray-300 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-700">No loan applications yet</h2>
            <p className="text-sm text-gray-500">You haven’t applied for a loan yet. Start your first application now.</p>
            <Link
              to="/apply"
              className="inline-flex items-center justify-center bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-200"
            >
              Apply for Loan
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {loans.map((loan) => {
              const sc = statusConfig[loan.status];
              const StatusIcon = sc.icon;

              return (
                <div key={loan._id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} alt={user.fullName || 'Profile'} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-700" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{user?.fullName || loan.name}</h3>
                        <p className="text-xs text-gray-500">Loan ID: {loan._id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${sc.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {sc.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-xs text-blue-600 mb-1">Loan Amount</p>
                      <p className="text-xl font-bold text-blue-700">₹{loan.givingMoney.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <p className="text-xs text-indigo-600 mb-1">Interest</p>
                      <p className="text-xl font-bold text-indigo-700">{loan.interest}%</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                      <p className="text-xs text-green-600 mb-1">Due Amount</p>
                      <p className="text-xl font-bold text-green-700">₹{loan.dueAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setViewImage(loan.signature)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm text-gray-600"
                    >
                      <Eye className="w-4 h-4" /> View Signature
                    </button>
                    <button
                      onClick={() => setViewImage(loan.documentPhoto)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm text-gray-600"
                    >
                      <Eye className="w-4 h-4" /> View Document
                    </button>
                    <div className="ml-auto inline-flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      Applied on {new Date(loan.createdAt).toLocaleDateString('en-IN')}
                    </div>
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

export default MyLoans;
