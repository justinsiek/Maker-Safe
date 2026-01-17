import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Makers from '../components/Makers.jsx'
import Violations from '../components/Violation.jsx'
import MapComponent from '../components/MapComponent.jsx'

export default function Dashboard() {
    const [makers, setMakers] = useState([])
    const [stations, setStations] = useState([])
    const [violations, setViolations] = useState([])  // ADD THIS
    const [socket, setSocket] = useState(null)

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

    useEffect(() => {
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

        // *** ADD THIS: Listen for violation_detected events ***
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
                    // Add to beginning of list (newest first)
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

    return (
        <div className="flex flex-row h-screen w-screen">
            <div className="flex flex-col bg-gray-50 h-screen w-[50%]">
                <Makers makers={makers} />
                <MapComponent makers={makers} stations={stations} />
            </div>
            <div className="flex flex-col bg-white h-screen w-[50%] overflow-y-auto">
                <Violations violations={violations} />  {/* PASS violations */}
            </div>
        </div>
    )
}