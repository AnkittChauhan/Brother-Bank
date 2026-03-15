import { useUser, SignedIn, UserButton } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Shield } from 'lucide-react';

const Navbar = () => {
    const { user } = useUser();
    const location = useLocation();
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';

    const navLinks = isAdmin
        ? [
            { to: '/admin', label: 'Dashboard', icon: Shield },
        ]
        : [
            { to: '/', label: 'Home', icon: Home },
            { to: '/apply', label: 'Apply', icon: FileText },
        ];

    return (
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 group-hover:shadow-lg transition-shadow">
                            <span className="text-white font-bold text-sm">BB</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800 hidden sm:block">
                            Brother <span className="text-blue-600">Bank</span>
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1">
                        {navLinks.map(({ to, label, icon: Icon }) => {
                            const isActive = location.pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-3">
                        <SignedIn>
                            <span className="text-sm text-gray-500 hidden md:block">
                                {user?.firstName || 'User'}
                            </span>
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: 'w-9 h-9 rounded-xl',
                                    },
                                }}
                            />
                        </SignedIn>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
