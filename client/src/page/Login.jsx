import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import makersafe from '@/assets/makersafe.png'
import logo from '@/assets/logo.png'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn')) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (username === 'SlugSpace' && password === 'password') {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', username)
      navigate('/dashboard')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A100FF] via-[#B525FF] to-[#D070FF] text-white font-['Inter',sans-serif] flex items-center justify-center px-4 py-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#A100FF]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#A100FF]/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 bg-surface p-10 rounded-lg">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MakerSafe Logo" className="w-18" />
            <img src={makersafe} alt="MakerSafe" className="w-40 my-[-50px] ml-[-30px]" />
          </div>
        </div>

        {/* Back to website link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#A100FF] text-sm font-medium mb-8 hover:text-[#8B00E6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO WEBSITE
        </button>

        {/* Welcome text */}
        <h1 className="text-4xl mb-2 text-black">Welcome back</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-8">
          {/* Username field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
              Username
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg focus:border-[#A100FF] focus:ring-2 focus:ring-[#A100FF]/20 outline-none transition-all text-white placeholder:text-gray-600"
                placeholder="SlugSpace"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg focus:border-[#A100FF] focus:ring-2 focus:ring-[#A100FF]/20 outline-none transition-all text-white placeholder:text-gray-600"
                placeholder="••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me and Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#2A2A2A] bg-[#1A1A1A] text-[#A100FF] focus:ring-[#A100FF] focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-black group-hover:text-gray-300 transition-colors">
                Remember Me
              </span>
            </label>
            
            <button
              type="button"
              className="text-sm text-black hover:text-gray-300 transition-colors font-medium"
            >
              Forgot Password?
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Sign in button */}
          <button
            type="submit"
            className="w-full bg-[#A100FF] hover:bg-[#8B00E6] text-white font-semibold py-3.5 rounded-lg transition-all shadow-lg shadow-[#A100FF]/20 flex items-center justify-center gap-2 group"
          >
            Sign In
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#2A2A2A] flex items-center justify-between text-xs text-gray-500">
          <span>© 2026 MAKERSAFE</span>
          <div className="flex gap-4">
            <button className="hover:text-gray-300 transition-colors">Support</button>
            <button className="hover:text-gray-300 transition-colors">Docs</button>
          </div>
        </div>

        {/* Powered by */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-wider">POWERED BY VIAM</p>
        </div>
      </div>
    </div>
  )
}