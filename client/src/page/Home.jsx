import { useNavigate } from 'react-router-dom';
import { TypingAnimation } from '@/components/ui/typing-animation.jsx'
import { motion } from 'framer-motion';

import { 
  Sparkles, Bot, Camera, LayoutGrid, ChevronRight, Zap, 
  CheckCircle2, AlertCircle, Cpu, HardDrive, Share2, ArrowRight
} from 'lucide-react';
import { Safari } from "@/components/ui/safari.jsx"
import assets from "@/assets/assets.png"
import Nav from '@/components/Nav.jsx'
export default function Home() {
  const navigate = useNavigate();

  const handleNavigateToDashboard = () => {
    if (localStorage.getItem('isLoggedIn')) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  const handleReset = async () => {
    try {
        const response = await fetch('http://localhost:8080/logout', {
            method: 'POST'
        })
        
        const data = await response.json()
        
        if (data.success) {
            console.log('System reset successful:', data.message)
            setMakers([])
            setStations([])
            setViolations([])
            
            if (socket) {
                socket.disconnect()
            }
            localStorage.removeItem('isLoggedIn')
            navigate('/')
        } else {
            console.error('Logout failed:', data.error)
            alert('Failed to reset system: ' + (data.error || 'Unknown error'))
        }
    } catch (error) {
        console.error('Error calling logout:', error)
        alert('Failed to connect to server')
    }
}

const handleLogout = async () => {
    localStorage.removeItem('isLoggedIn')
    navigate('/')
}

  return (
    <div className="min-h-screen bg-white text-black font-['Inter',sans-serif] selection:bg-[#A100FF] selection:text-white relative overflow-hidden">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      </style>

      {/* --- Existing Navigation & Hero (Condensed for brevity) --- */}
      <Nav />

            {/* --- Announcement Banner --- */}
      <div className="bg-[#A100FF] text-white py-3 px-4 text-center">
        <p className="text-[11px] font-[800] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          <span className="opacity-70 font-black">● LIVE:</span>
          MakerSafe Safety Protocol v1.0 is now active. 
          <button className="underline underline-offset-4 hover:opacity-80 transition-opacity ml-1">
            Click to view safety report
          </button>
        </p>
      </div>

      {/* --- Navigation --- */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 pt-6 pb-3 grid lg:grid-cols-2 gap-20 items-center"> </header>


      <header className="relative z-10 max-w-7xl mx-auto px-8 pt-12 pb-24 grid lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8 ">
            {/* <h1 className="text-6xl lg:text-6xl font-[900] leading-[1.05] tracking-tight">Safety for the next generation of <span className="text-[#A100FF]">Makers.</span></h1> */}
            <div className="flex flex-col">
              <TypingAnimation cursorStyle = "underscore" typeSpeed={50} className="font-bold text-5xl lg:text-6xl leading-[1.05] tracking-tight">For the Makers,</TypingAnimation>
              <TypingAnimation cursorStyle = "underscore" typeSpeed={50} delay={1000} className="font-bold text-5xl lg:text-6xl leading-[1.05] tracking-tight text-accent">By the Makers.</TypingAnimation>
            </div>

            <p className="text-lg text-[#6F6F6F] max-w-md mt-10">Real-time computer vision for school workshops. Monitor PPE compliance and station availability with one simple system.</p>
            <button onClick={() => handleNavigateToDashboard()} className="bg-[#A100FF] text-white px-8 py-4 rounded-xl shadow-xl shadow-[#A100FF]/25 hover:scale-105 transition-transform">Launch Dashboard</button>
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          >
            <Safari url="https://www.makersafe.io" imageSrc={assets} mode="default" />
          </motion.div>
        
        </div>

      </header>

      {/* --- NEW: HOW IT WORKS SECTION --- */}
      <section className="py-24 bg-[#D9DDDC] border-t border-[#E6E6E6] pb-27">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <h2 className="text-sm uppercase tracking-[0.3em] text-[#A100FF] mb-4">Workflow</h2>
            <h3 className="text-4xl font-bold tracking-tight">The 3-Step Safety Loop</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection line (visible on desktop) */}
            <div className="hidden md:block absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E6E6E6] to-transparent -z-10"></div>

            <WorkflowStep 
              number="01"
              title="Identity Check"
              desc="The Login Camera uses Viam Face ID to recognize students as they enter. They appear on the dash as 'Idle'."
              icon={<Share2 className="text-[#A100FF]" />}
            />
            <WorkflowStep 
              number="02"
              title="Station Monitor"
              desc="Step into a machine zone (like a lathe). The system marks the station 'In Use' and begins PPE scanning."
              icon={<Camera className="text-[#A100FF]" />}
            />
            <WorkflowStep 
              number="03"
              title="Instant Response"
              desc="Goggles off? The SenseCAP flashes red, the dashboard logs a snapshot, and you stay safe."
              icon={<Zap className="text-[#A100FF]" />}
            />
          </div>
        </div>
      </section>

      {/* --- NEW: HARDWARE SECTION --- */}
      <section className="py-24 bg-[#F5F5F5] border-y border-[#E6E6E6]">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#A100FF] mb-4">Hardware</h2>
            <h3 className="text-4xl font-[800] tracking-tight mb-6">Built for the Workshop.</h3>
            <p className="text-[#6F6F6F] font-medium leading-relaxed mb-8">
              MakerSafe runs on a distributed edge architecture. By processing video locally on a Raspberry Pi, we ensure low latency and student privacy.
            </p>
            
            <div className="space-y-4">
                <HardwareItem title="Raspberry Pi 4 (8GB)" detail="The edge brain running Viam's ML inference." />
                <HardwareItem title="USB Vision Sensors" detail="Dual 1080p cameras for entrance and station views." />
                <HardwareItem title="SenseCAP Indicator" detail="Industrial-grade RGB feedback for visual alerts." />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-white rounded-3xl border border-[#E6E6E6] flex flex-col items-center justify-center p-8 text-center group hover:border-[#A100FF] transition-colors">
               <Cpu className="w-10 h-10 text-[#A100FF] mb-4 group-hover:scale-110 transition-transform" />
               <span className="text-xs font-black uppercase tracking-widest text-[#6F6F6F]">Processor</span>
               <span className="text-sm font-bold">Arm Cortex-A72</span>
            </div>
            <div className="aspect-square bg-white rounded-3xl border border-[#E6E6E6] flex flex-col items-center justify-center p-8 text-center group hover:border-[#A100FF] transition-colors">
               <HardDrive className="w-10 h-10 text-[#A100FF] mb-4 group-hover:scale-110 transition-transform" />
               <span className="text-xs font-black uppercase tracking-widest text-[#6F6F6F]">Storage</span>
               <span className="text-sm font-bold">Supabase DB</span>
            </div>
            <div className="col-span-2 bg-[#1A1A1A] rounded-3xl p-8 flex items-center justify-between text-white border border-white/5 shadow-2xl shadow-[#A100FF]/10">
               <div>
                  <h4 className="font-black text-xl uppercase tracking-tighter">Viam Integrated</h4>
                  <p className="text-white/40 text-xs font-medium">Remote machine management & AI inference</p>
               </div>
               <div className="bg-[#A100FF] p-3 rounded-xl"><Bot className="w-6 h-6" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-16 text-center text-[#6F6F6F] bg-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#c7c6c6]">MakerSafe // 2026</p>
        </footer>
    </div>
  );
}

// Sub-components for cleaner code
function WorkflowStep({ number, title, desc, icon }) {
  return (
    <div className="relative p-8 bg-[#F5F5F5] border border-[#E6E6E6] rounded-2xl hover:border-[#A100FF] transition-all group">
      <div className="absolute -top-4 -left-4 w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center font-black text-sm">{number}</div>
      <div className="mb-6 w-12 h-12 bg-white rounded-xl border border-[#E6E6E6] flex items-center justify-center group-hover:shadow-lg group-hover:shadow-[#A100FF]/10 transition-all">{icon}</div>
      <h4 className="text-xl font-black tracking-tight mb-2 uppercase">{title}</h4>
      <p className="text-sm text-[#6F6F6F] leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function HardwareItem({ title, detail }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1.5 w-2 h-2 rounded-full bg-[#A100FF]"></div>
      <div>
        <h5 className="font-bold text-sm uppercase tracking-tight">{title}</h5>
        <p className="text-xs text-[#6F6F6F] font-medium">{detail}</p>
      </div>
    </div>
  );
}