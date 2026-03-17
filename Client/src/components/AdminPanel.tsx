import { SignedIn } from "@clerk/clerk-react";
import { Shield, ArrowRight, } from "lucide-react";
import { useNavigate } from "react-router-dom";


const AdminPanel = () => {


    // const { isSignedIn, user } = useUser();
    const navigate = useNavigate();

    const handleAdminLogin = () => {
        localStorage.setItem("isAdminLoggedIn", "true");
        navigate("/admin");
    };

    return (
        <>
            <SignedIn>
                <div className="w-full max-w-md flex flex-col">
                    <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 h-full flex flex-col justify-center transform transition-all duration-300 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)]">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-slate-700 to-slate-900 rounded-2xl mb-6 shadow-lg shadow-slate-300">
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
                            className="w-full bg-linear-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-slate-300 transition-all duration-300 flex items-center justify-center gap-3 group"
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
            </SignedIn>
        </>
    )
}

export default AdminPanel