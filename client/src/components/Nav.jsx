import { useNavigate, useLocation } from 'react-router-dom';
import logo from '@/assets/logo.png'
// import logo from '@/assets/logo-inverted.png'
// import makersafe from '@/assets/word-inverted.png'
import makersafe from '@/assets/makersafe.png'

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
            localStorage.removeItem('username');
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
        <nav className="flex items-center justify-between px-6 py-3 bg-accent border-b-3 border-accent-hover bg-bg">
            <div 
                className="flex cursor-pointer justify-center items-center" 
                onClick={handleLogoClick}
            >
                <img src={logo} alt="MakerSafe Logo" className="w-18" />
                <img src={makersafe} alt="MakerSafe" className="w-40 my-[-50px] ml-[-15px]" />
            </div>
            <div className="flex gap-2">
                {/* Show Reset button when logged in */}
                {isLoggedIn && (
                    <button 
                        onClick={onReset}
                        className="text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-accent-hover transition-colors"
                    >
                        Reset System
                    </button>
                )}
                
                {/* Show Log Out if logged in, otherwise show Log In */}
                {isLoggedIn ? (
                    <button 
                        onClick={onLogout}
                        className="text-black px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-accent-hover transition-colors"
                    >
                        Log Out
                    </button>
                ) : (
                    <button 
                        onClick={onLogout}
                        className="text-text px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        Log Out
                    </button>
                )}
            </div>
        </nav>
    );
}