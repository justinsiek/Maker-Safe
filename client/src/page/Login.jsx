import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '@/components/Nav.jsx'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn')) {
      navigate('/dashboard')
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (username === 'SlugSpace' && password === 'password') {
      localStorage.setItem('isLoggedIn', true)
      navigate('/dashboard')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#E6E6E6]">
      {/* Navbar at the top */}
      <Nav />
      
      {/* Centered login content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">
              Maker<span className="text-[#A100FF]">Safe</span>
            </h1>
            <p className="text-sm text-[#6F6F6F] font-normal">
              Makerspace Safety Management System
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-[#E6E6E6]">
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-6">
              Sign In
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-sm font-medium text-[#1A1A1A] mb-2"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#E6E6E6] rounded-lg focus:outline-none focus:border-[#A100FF] transition-colors text-[#1A1A1A] placeholder:text-[#9A9A9A]"
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-[#1A1A1A] mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#E6E6E6] rounded-lg focus:outline-none focus:border-[#A100FF] transition-colors text-[#1A1A1A] placeholder:text-[#9A9A9A]"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#A100FF] hover:bg-[#8B00E6] text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Sign In
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-[#6F6F6F] font-normal">
                Need access? Contact your makerspace administrator
              </p>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="text-center mt-6">
            <p className="text-xs text-[#6F6F6F] font-normal">
              © 2026 MakerSafe. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}