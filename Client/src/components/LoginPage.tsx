import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { FileText, Receipt, ArrowRight, Landmark } from "lucide-react";
import AdminPanel from "./AdminPanel";

const LoginPage = () => {
    const { isSignedIn, user } = useUser();
    const navigate = useNavigate();

    const handleUserApply = () => {
        localStorage.setItem("isAdminLoggedIn", "false");
        navigate("/apply");
    };

    const handleMyLoans = () => {
        localStorage.setItem("isAdminLoggedIn", "false");
        navigate("/my-loans");
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
            <div className="flex flex-col md:flex-row gap-8 max-w-5xl w-full items-stretch justify-center">
                {/* Left: Auth / User Card */}
                <div className="w-full max-w-md flex flex-col">
                    <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 h-full flex flex-col justify-center transform transition-all duration-300 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)]">
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-blue-200">
                                <Landmark className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Brother <span className="text-blue-600">Bank</span>
                            </h1>
                            <p className="text-gray-500 text-sm">
                                Loan Management System / ऋण प्रबंधन प्रणाली
                            </p>
                        </div>

                        {/* Welcome */}
                        <div className="text-center mb-8">
                            {isSignedIn ? (
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold text-gray-800">
                                        Welcome,{" "}
                                        <span className="text-blue-600">{user.firstName}</span>!
                                    </h2>
                                    <p className="text-gray-500">
                                        Choose an option below to continue
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold text-gray-800">
                                        Welcome Back
                                    </h2>
                                    <p className="text-gray-500">
                                        Please sign in to access your dashboard
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-2 group">
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        Sign In to Continue
                                    </button>
                                </SignInButton>
                            </SignedOut>

                            <SignedIn>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={handleUserApply}
                                        className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-2 group"
                                    >
                                        <FileText className="w-5 h-5" />
                                        Apply for Loan
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <button
                                        onClick={handleMyLoans}
                                        className="w-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-200 transition-all duration-300 flex items-center justify-center gap-2 group"
                                    >
                                        <Receipt className="w-5 h-5" />
                                        My Loans
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </SignedIn>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-400">
                                Secure authentication powered by Clerk
                            </p>
                        </div>
                    </div>
                </div>



                {user?.primaryEmailAddress?.emailAddress == import.meta.env.VITE_ADMIN_EMAIL && <AdminPanel />}



                {/* Right: Admin Card */}
                {/* <SignedIn>
                    <div className="w-full max-w-md flex flex-col">
                        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 h-full flex flex-col justify-center transform transition-all duration-300 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)]">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl mb-6 shadow-lg shadow-slate-300">
                                    <Shield className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    Admin Panel
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    View and manage all loan applications
                                </p>
                            </div>

                            <button
                                onClick={handleAdminLogin}
                                className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-slate-300 transition-all duration-300 flex items-center justify-center gap-3 group"
                            >
                                <Shield className="w-5 h-5" />
                                Enter Admin Dashboard
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-400">
                                    Admin access to review all submitted applications
                                </p>
                            </div>
                        </div>
                    </div>
                </SignedIn> */}
            </div>
        </div>
    );
};

export default LoginPage;