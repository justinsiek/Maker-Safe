import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ShieldAlert, 
  ChevronRight, 
  Lock, 
  User, 
  Info, 
  Bot,
  ArrowLeft,
  // Hardware/Safety Icons
  Cpu, 
  Activity, 
  Eye, 
  Camera, 
  Database, 
  Network, 
  Box, 
  Zap,
  Radio
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

    if (username.trim() !== '' && username === password) {
      localStorage.setItem('isLoggedIn', 'true')
      navigate('/dashboard')
    } else {
      setError('Access Denied: Credentials do not match our safety records.')
    }
  }

  return (
    <div className="min-h-screen bg-white text-black font-['Inter',sans-serif] selection:bg-[#A100FF] selection:text-white flex flex-col overflow-hidden">
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

      <div className="flex-1 flex flex-col lg:flex-row h-full">
        
        {/* LEFT SIDE: Login Form */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 lg:px-20 py-12 relative bg-white z-10">
          
          <div className="max-w-md w-full mx-auto">
            {/* Logo */}
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity cursor-pointer group"
            >
              <div className="bg-[#A100FF] p-1.5 rounded-lg shadow-lg shadow-[#A100FF]/20 group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">
                Maker<span className="text-[#A100FF]">Safe</span>
              </span>
            </button>

            <div className="mb-10">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#A100FF] mb-4 hover:translate-x-[-4px] transition-transform cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" /> Back to website
              </button>
              
              <h1 className="text-4xl font-[900] tracking-tight text-[#1A1A1A] mb-3">
                Welcome back
              </h1>
            </div>

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
                    <button onClick={() => navigate('/')} className="hover:text-[#A100FF] cursor-pointer">Support</button>
                    <button onClick={() => navigate('/')} className="hover:text-[#A100FF] cursor-pointer">Docs</button>
                  </div>
               </div>
            </footer>
          </div>
        </div>

        {/* RIGHT SIDE: Brand Gradient & Icon Cloud */}
        <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-[#A100FF] via-[#8B00E6] to-[#7000B2] relative items-center justify-center p-20 overflow-hidden">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-[10%] left-[10%] w-32 h-32 rounded-full border-4 border-white/10"></div>
          <div className="absolute bottom-[10%] right-[10%] w-64 h-64 rounded-[3rem] border-4 border-white/5 rotate-12"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/5 rounded-full blur-3xl"></div>

          {/* Floating Icon Cloud */}
          <div className="absolute inset-0 z-0">
            {/* Top Left Cluster */}
            <div className="absolute top-[15%] left-[15%] animate-bounce [animation-duration:3s]">
              <Camera className="w-10 h-10 text-white/20 -rotate-12" />
            </div>
            <div className="absolute top-[25%] left-[30%] animate-pulse">
              <Eye className="w-6 h-6 text-white/40" />
            </div>

            {/* Top Right Cluster */}
            <div className="absolute top-[20%] right-[20%] animate-pulse [animation-delay:1s]">
              <Cpu className="w-12 h-12 text-white/30 rotate-12" />
            </div>
            <div className="absolute top-[35%] right-[25%]">
              <Zap className="w-8 h-8 text-white/20 -rotate-45" />
            </div>

            {/* Middle Section (Spread out since big icon is gone) */}
            <div className="absolute top-1/2 left-[15%] -translate-y-1/2 animate-pulse">
              <Radio className="w-9 h-9 text-white/25" />
            </div>
            <div className="absolute top-1/2 right-[15%] -translate-y-1/2 animate-bounce [animation-duration:5s]">
              <Network className="w-10 h-10 text-white/20" />
            </div>

            {/* Bottom Left Cluster */}
            <div className="absolute bottom-[20%] left-[20%] animate-bounce [animation-duration:4s]">
              <Database className="w-10 h-10 text-white/20" />
            </div>
            <div className="absolute bottom-[35%] left-[25%] opacity-40">
              <ShieldAlert className="w-8 h-8 text-white/30" />
            </div>

            {/* Bottom Right Cluster */}
            <div className="absolute bottom-[15%] right-[20%] animate-pulse [animation-delay:0.5s]">
              <Activity className="w-14 h-14 text-white/20" />
            </div>
            <div className="absolute bottom-[30%] right-[30%]">
              <Box className="w-8 h-8 text-white/40 rotate-12" />
            </div>
          </div>

          {/* Optional: Subtle branding in the corner of the gradient area */}
          <div className="absolute bottom-12 right-12 text-right">
             <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Safety Infrastructure</p>
             <p className="text-white/20 text-xs font-bold italic uppercase tracking-tighter">Powered by Viam & SenseCAP</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}