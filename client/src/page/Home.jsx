import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">landing page</h1>
      <button 
        className="bg-black text-white cursor-pointer px-6 py-3 rounded-lg "
        onClick={() => navigate('/login')}
      >
        Login
      </button>
    </div>
  )
}
