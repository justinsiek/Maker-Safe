import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import Makers from '../components/Makers.jsx'
import Violations from '../components/Violation.jsx'
import MapComponent from '../components/MapComponent.jsx'
import LiveAlert from '../components/LiveAlert.jsx'
import { StickyBanner } from "@/components/ui/sticky-banner";
import Clock from '@/components/Clock.jsx'
import Nav from '@/components/Nav.jsx'

export default function Dashboard() {
    const navigate = useNavigate()
    const [makers, setMakers] = useState([])
    const [stations, setStations] = useState([])
    const [violations, setViolations] = useState([])
    const [socket, setSocket] = useState(null)
    const isLoggedIn = localStorage.getItem('isLoggedIn')

    // If not logged in, redirect to login page
    if (!isLoggedIn) {
        navigate('/login')
    }

    // Helper function to get initials from name
    const getInitials = (name) => {
        if (!name) return '??'
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    // Helper to format violation type for display
    const formatViolationType = (type) => {
        return type
            .split('_')
            .map(word => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' ')
    }

    // Helper to get severity color based on violation type
    const getSeverityColor = (violationType) => {
        const highSeverity = ['GOGGLES_NOT_WORN', 'PPE_MISSING', 'SAFETY_GLASSES']
        return highSeverity.includes(violationType) ? 'bg-red-600' : 'bg-neutral-600'
    }

// Fetch initial state from server
    const fetchInitialState = async () => {
        try {
            const response = await fetch('http://localhost:8080/state')
            const data = await response.json()
            console.log('Initial state loaded:', data)
            
            // Set makers
            if (data.makers && data.makers.length > 0) {
                setMakers(data.makers.map(m => ({
                    id: m.id,
                    name: m.display_name,
                    initials: getInitials(m.display_name),
                    status: m.status,
                    external_label: m.external_label,
                    stationId: m.station_id,
                    stationName: null, // Will be filled from stations
                })))
            }
            
            // Set stations
            if (data.stations && data.stations.length > 0) {
                setStations(data.stations.map(s => ({
                    id: s.id,
                    name: s.name,
                    inUse: s.in_use,  // Changed from 'status' to 'inUse' (camelCase for JS)
                    assignedMakerId: s.active_maker_id,
                    assignedMakerName: null, // Will be filled from makers
                })))
            }
            
            // Set violations
            if (data.violations && data.violations.length > 0) {
                setViolations(data.violations.map(v => ({
                    id: v.id,
                    name: v.maker_name || 'Unknown',
                    violation: formatViolationType(v.violation_type),
                    violationType: v.violation_type,
                    severity: v.violation_type.includes('GOGGLES') || v.violation_type.includes('PPE') ? 'high' : 'medium',
                    severityColor: getSeverityColor(v.violation_type),
                    location: v.station_name || 'Unknown',
                    time: new Date(v.created_at).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                    }),
                    description: `${v.violation_type.replace(/_/g, ' ').toLowerCase()} violation detected`,
                    image: v.image_url,
                    createdAt: v.created_at,
                    makerId: v.maker_id,
                    stationId: v.station_id,
                })))
            }
        } catch (error) {
            console.error('Failed to fetch initial state:', error)
        }
    }

    useEffect(() => {
        // Fetch initial state on mount
        fetchInitialState()
        
        const newSocket = io('http://localhost:8080', {
            transports: ['websocket', 'polling'],
        })

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket server')
        })

        newSocket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server')
        })

        // Listen for maker check-in events
        newSocket.on('maker_checked_in', (makerData) => {
            console.log('Maker checked in:', makerData)
            
            setMakers((prevMakers) => {
                const existingIndex = prevMakers.findIndex(m => m.id === makerData.id)
                
                if (existingIndex !== -1) {
                    const updatedMakers = [...prevMakers]
                    updatedMakers[existingIndex] = {
                        ...updatedMakers[existingIndex],
                        status: makerData.status,
                        name: makerData.display_name,
                    }
                    return updatedMakers
                } else {
                    return [...prevMakers, {
                        id: makerData.id,
                        name: makerData.display_name,
                        initials: getInitials(makerData.display_name),
                        status: makerData.status,
                        external_label: makerData.external_label,
                        stationId: null,
                        stationName: null,
                    }]
                }
            })
        })

        // Listen for station_entered events
        newSocket.on('station_entered', (data) => {
            console.log('Station entered:', data)
            
            const { maker, station } = data

            if (maker) {
                setMakers((prevMakers) => {
                    const existingIndex = prevMakers.findIndex(m => m.id === maker.id)
                    
                    if (existingIndex !== -1) {
                        const updatedMakers = [...prevMakers]
                        updatedMakers[existingIndex] = {
                            ...updatedMakers[existingIndex],
                            status: maker.status,
                            stationId: station?.id || null,
                            stationName: station?.name || null,
                        }
                        return updatedMakers
                    } else {
                        return [...prevMakers, {
                            id: maker.id,
                            name: maker.display_name,
                            initials: getInitials(maker.display_name),
                            status: maker.status,
                            external_label: maker.external_label,
                            stationId: station?.id || null,
                            stationName: station?.name || null,
                        }]
                    }
                })
            }

            if (station) {
                setStations((prevStations) => {
                    const existingIndex = prevStations.findIndex(s => s.id === station.id)
                    
                    if (existingIndex !== -1) {
                        const updatedStations = [...prevStations]
                        updatedStations[existingIndex] = {
                            ...updatedStations[existingIndex],
                            name: station.name,
                            status: station.status,
                            assignedMakerId: maker?.id || null,
                            assignedMakerName: maker?.display_name || null,
                        }
                        return updatedStations
                    } else {
                        return [...prevStations, {
                            id: station.id,
                            name: station.name,
                            status: station.status,
                            assignedMakerId: maker?.id || null,
                            assignedMakerName: maker?.display_name || null,
                        }]
                    }
                })
            }
        })

        // Listen for station_left events
        newSocket.on('station_left', (data) => {
            console.log('Station left:', data)
            
            const { maker, station } = data

            // Update maker - clear station assignment and set status to idle
            if (maker) {
                setMakers((prevMakers) => {
                    return prevMakers.map(m => 
                        m.id === maker.id 
                            ? { 
                                ...m, 
                                status: maker.status,
                                stationId: null,
                                stationName: null,
                              }
                            : m
                    )
                })
            }

            // Update station - clear assignment and set status to idle/available
            if (station) {
                setStations((prevStations) => {
                    return prevStations.map(s => 
                        s.id === station.id 
                            ? { 
                                ...s, 
                                status: station.status,
                                assignedMakerId: null,
                                assignedMakerName: null,
                              }
                            : s
                    )
                })
            }
        })

        // Listen for violation_detected events
        newSocket.on('violation_detected', (data) => {
            console.log('Violation detected:', data)
            
            const { maker, station, violation } = data

            // Update maker status to violation
            if (maker) {
                setMakers((prevMakers) => {
                    return prevMakers.map(m => 
                        m.id === maker.id 
                            ? { ...m, status: maker.status }
                            : m
                    )
                })
            }

            // Update station status to violation
            if (station) {
                setStations((prevStations) => {
                    return prevStations.map(s => 
                        s.id === station.id 
                            ? { ...s, status: station.status }
                            : s
                    )
                })
            }

            // Add new violation to the list
            if (violation) {
                const newViolation = {
                    id: violation.id,
                    name: maker?.display_name || 'Unknown',
                    violation: formatViolationType(violation.violation_type),
                    violationType: violation.violation_type,
                    severity: violation.violation_type.includes('GOGGLES') || violation.violation_type.includes('PPE') ? 'high' : 'medium',
                    severityColor: getSeverityColor(violation.violation_type),
                    location: station?.name || 'Unknown',
                    time: new Date(violation.created_at).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                    }),
                    description: `${violation.violation_type.replace(/_/g, ' ').toLowerCase()} violation detected`,
                    image: violation.image_url,
                    createdAt: violation.created_at,
                    makerId: maker?.id,
                    stationId: station?.id,
                }

                setViolations((prevViolations) => {
                    return [newViolation, ...prevViolations]
                })
            }
        })

        // Listen for maker status updates
        newSocket.on('maker_status_updated', (data) => {
            console.log('Maker status updated:', data)
            
            setMakers((prevMakers) => {
                return prevMakers.map(maker => 
                    maker.id === data.id 
                        ? { ...maker, status: data.status }
                        : maker
                )
            })
        })

        // Listen for maker checkout
        newSocket.on('maker_checked_out', (data) => {
            console.log('Maker checked out:', data)
            
            setMakers((prevMakers) => {
                return prevMakers.filter(maker => maker.id !== data.id)
            })

            setStations((prevStations) => {
                return prevStations.map(station => 
                    station.assignedMakerId === data.id
                        ? { ...station, status: 'available', assignedMakerId: null, assignedMakerName: null }
                        : station
                )
            })
        })

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [])

    // Add this function inside Dashboard component (before the return statement)
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
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg">
            {/* Navbar */}
            <Nav handleReset={handleReset} handleLogout={handleLogout} />
            <StickyBanner className="bg-gradient-to-r from-[#A100FF] to-[#8B00E6]">
                <p className="text-white">
                    Makerspace will be closed on January 19th in observance of Martin Luther King Jr. Day.
                </p>
            </StickyBanner>
            {/* Main Content */}
            <div className="flex overflow-hidden justify-evenly w-full">
                <div className="flex flex-col w-[55%] h-full">
                    <Makers makers={makers} />
                    <MapComponent makers={makers} stations={stations} />
                </div>
                <div className="flex flex-col bg-white w-[40%] overflow-y-auto scrollbar-hide h-[90]">
                    <Clock />
                    <LiveAlert />
                    <Violations violations={violations} />
                </div>
            </div>
            <footer className="py-16 text-center text-[#6F6F6F] bg-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#c7c6c6]">MakerSafe // 2026</p>
            </footer>
        </div>
    )
}