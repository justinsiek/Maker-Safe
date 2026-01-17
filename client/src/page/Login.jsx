import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (username === 'SlugSpace' && password === 'password') {
      navigate('/dashboard')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
            />
          </div>
          
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            className="w-full bg-black text-white cursor-pointer px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}
