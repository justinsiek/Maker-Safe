import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ChevronRight, Lock, User, Info } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is already "logged in"
    if (localStorage.getItem('isLoggedIn')) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Simple "fake auth" logic as per PRD: username == username & password == password
    if (username.trim() !== '' && username === password) {
      localStorage.setItem('isLoggedIn', 'true')
      if (rememberMe) localStorage.setItem('rememberedUser', username)
      navigate('/dashboard')
    } else {
      // Using the Red banner style for errors
      setError('Access Denied: Credentials do not match our safety records.')
    }
  }

  return (
    <div className="min-h-screen bg-white text-black font-['Inter',sans-serif] selection:bg-[#A100FF] selection:text-white">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      </style>

      {/* --- High Visibility Announcement Banner --- */}
      <div className="bg-[#1A1A1A] text-white py-3 px-4 text-center border-b border-[#A100FF]/30">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          <ShieldAlert className="w-3 h-3 text-[#A100FF]" /> 
          Authorized Personnel Only
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-44px)] px-4 bg-[#F5F5F5]">
        <div className="w-full max-w-md">
          
          {/* Brand Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#A100FF] rounded-2xl shadow-xl shadow-[#A100FF]/20 mb-6 rotate-3">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-[900] uppercase tracking-tighter text-[#1A1A1A]">
              Maker<span className="text-[#A100FF]">Safe</span>
            </h1>
            <p className="text-[11px] font-bold text-[#6F6F6F] uppercase tracking-widest mt-2">
              Sign in
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/5 p-10 border border-[#E6E6E6] relative overflow-hidden">
            
            {/* Error Banner (FTW Retreat Style) */}
            {error && (
              <div className="absolute top-0 left-0 w-full bg-[#E5484D] text-white py-3 px-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <p className="text-[11px] font-bold text-center flex items-center justify-center gap-2">
                  <Info className="w-3.5 h-3.5" /> {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className={`space-y-6 ${error ? 'mt-8' : ''}`}>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-[#6F6F6F] mb-2 px-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6F6F]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#A100FF] focus:bg-white outline-none transition-all font-medium text-sm"
                    placeholder="e.g. SlugSpace"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-[#6F6F6F] mb-2 px-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6F6F]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#A100FF] focus:bg-white outline-none transition-all font-medium text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-[#E6E6E6] rounded-md checked:bg-[#A100FF] checked:border-[#A100FF] transition-all"
                    />
                    <CheckCircle2 className="absolute w-3.5 h-3.5 text-white left-[3px] opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-bold text-[#6F6F6F] group-hover:text-[#1A1A1A] transition-colors">Remember Station</span>
                </label>
                
                <button 
                type="button"
                className="text-xs font-black uppercase tracking-tighter text-[#A100FF] hover:text-[#8B00E6] transition-colors cursor-pointer"
              >
                Reset Password?
              </button>
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#1A1A1A] hover:bg-[#A100FF] text-white font-black uppercase tracking-[0.2em] text-xs px-6 py-5 rounded-xl transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
              >
                Authenticate <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          <p className="text-center mt-8 text-[10px] font-bold text-[#6F6F6F] uppercase tracking-[0.3em]">
            System hardware: Pi-8GB // Viam-Ready
          </p>
        </div>
      </div>
    </div>
  )
}

function CheckCircle2({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}