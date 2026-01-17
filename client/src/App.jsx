import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './page/Home'
import Dashboard from './page/Dashboard'
import Login from './page/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}