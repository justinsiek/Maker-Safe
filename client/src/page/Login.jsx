import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ShieldAlert, 
  ChevronRight, 
  Lock, 
  User, 
  Info, 
  Bot,
  CheckCircle2
} from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn')) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Login Logic: matches your PRD requirement
    if (username.trim() !== '' && username === password) {
      localStorage.setItem('isLoggedIn', 'true')
      navigate('/dashboard')
    } else {
      setError('Access Denied: Credentials do not match our safety records.')
    }
  }

  return (
    <div className="min-h-screen bg-white text-black font-['Inter',sans-serif] selection:bg-[#A100FF] selection:text-white flex flex-col">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      </style>

      {/* --- Top Global Banner --- */}
      <div className="bg-[#1A1A1A] text-white py-3 px-4 text-center border-b border-[#A100FF]/30 z-20">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          <ShieldAlert className="w-3 h-3 text-[#A100FF]" /> 
          Restricted Access: Authorized Personnel Only
        </p>
      </div>

      {/* --- Split Layout Container --- */}
      <div className="flex-1 flex flex-col lg:flex-row h-full">
        
        {/* LEFT SIDE: Login Form */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 lg:px-20 py-12 relative bg-white">
          
          <div className="max-w-md w-full mx-auto">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-12">
              <div className="bg-[#A100FF] p-1.5 rounded-lg shadow-lg shadow-[#A100FF]/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">
                Maker<span className="text-[#A100FF]">Safe</span>
              </span>
            </div>

            <div className="mb-10">
              <h1 className="text-4xl font-[900] tracking-tight text-[#1A1A1A] mb-3">
                Welcome back
              </h1>
            </div>

            {/* Error Message Section */}
            {error && (
              <div className="mb-6 p-4 bg-[#E5484D] text-white rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <Info className="w-4 h-4 shrink-0" />
                <p className="text-xs font-bold leading-tight">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6F6F] ml-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6F6F]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E6E6E6] rounded-xl focus:border-[#A100FF] focus:ring-4 focus:ring-[#A100FF]/5 outline-none transition-all font-medium text-sm"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6F6F] ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6F6F]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E6E6E6] rounded-xl focus:border-[#A100FF] focus:ring-4 focus:ring-[#A100FF]/5 outline-none transition-all font-medium text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border border-[#E6E6E6] rounded-md checked:bg-[#A100FF] checked:border-[#A100FF] transition-all cursor-pointer"
                    />
                    <CheckIcon className="absolute w-3 h-3 text-white left-[4px] opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-semibold text-[#6F6F6F] group-hover:text-[#1A1A1A] transition-colors">Remember Me</span>
                </label>
                
                <button 
                  type="button"
                  className="text-xs font-bold text-[#A100FF] hover:text-[#8B00E6] transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#A100FF] hover:bg-[#8B00E6] text-white font-bold px-6 py-4 rounded-xl transition-all shadow-lg shadow-[#A100FF]/20 flex items-center justify-center gap-2 group cursor-pointer"
              >
                Sign In <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <footer className="mt-12 pt-8 border-t border-[#F5F5F5]">
               <div className="flex items-center justify-between text-[10px] font-bold text-[#6F6F6F] uppercase tracking-widest">
                  <span>© 2026 MakerSafe</span>
                  <div className="flex gap-4">
                    <button className="hover:text-[#A100FF]">Support</button>
                    <button className="hover:text-[#A100FF]">Docs</button>
                  </div>
               </div>
            </footer>
          </div>
        </div>

        {/* RIGHT SIDE: Brand Gradient */}
        <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-[#A100FF] via-[#8B00E6] to-[#7000B2] relative items-center justify-center p-20 overflow-hidden">
          
          {/* Decorative Shapes */}
          <div className="absolute top-[10%] left-[10%] w-32 h-32 rounded-full border-4 border-white/10"></div>
          <div className="absolute bottom-[10%] right-[10%] w-64 h-64 rounded-[3rem] border-4 border-white/5 rotate-12"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-lg text-white">
             <div className="mb-8 flex items-center gap-3">
               <span className="text-2xl font-black tracking-tighter uppercase"></span>
             </div>
             
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Helper for Checkbox
function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}