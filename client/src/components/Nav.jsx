import { useNavigate, useLocation } from 'react-router-dom';
import React from 'react';

export default function Nav({ handleLogout = null, handleReset = null }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const isDashboard = location.pathname === '/dashboard';

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    const onLogout = () => {
        if (handleLogout) {
            handleLogout();
        } else {
            localStorage.removeItem('isLoggedIn');
            navigate('/login');
        }
    };

    const onReset = async () => {
        if (handleReset) {
            // Use the passed handleReset if available
            handleReset();
        } else {
            // Otherwise, call the reset route directly
            try {
                const response = await fetch('http://localhost:8080/logout', {
                    method: 'POST'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    console.log('System reset successful:', data.message);
                    alert('System reset successful! All operational data has been cleared.');
                    // Optionally reload the page to reflect changes
                    window.location.reload();
                } else {
                    alert('Failed to reset system: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error calling reset:', error);
                alert('Failed to connect to server');
            }
        }
    };

    return (
        <nav className="flex items-center justify-between px-6 py-2 bg-white border-b border-gray-200">
            <span 
                className="text-2xl font-bold cursor-pointer" 
                onClick={handleLogoClick}
            >
                Maker<span className="text-[#A100FF]">Safe</span>
            </span>
            <div className="flex gap-2">
                {/* Show Reset button when logged in */}
                {isLoggedIn && (
                    <button 
                        onClick={onReset}
                        className="text-black px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        Reset
                    </button>
                )}
                
                {/* Show Log Out if logged in, otherwise show Log In */}
                {isLoggedIn ? (
                    <button 
                        onClick={onLogout}
                        className="text-black px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        Log Out
                    </button>
                ) : (
                    <button 
                        onClick={handleLoginClick}
                        className="bg-[#A100FF] hover:bg-[#8B00E6] text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                    >
                        Log In
                    </button>
                )}
            </div>
        </nav>
    );
}