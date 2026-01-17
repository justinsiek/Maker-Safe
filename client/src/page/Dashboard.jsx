import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Makers from '../components/Makers.jsx'
import Violations from '../components/Violation.jsx'
import MapComponent from '../components/MapComponent.jsx'

export default function Dashboard() {
    const [makers, setMakers] = useState([])
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        // Connect to Flask-SocketIO server
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
                // Check if maker already exists in the list
                const existingIndex = prevMakers.findIndex(m => m.id === makerData.id)
                
                if (existingIndex !== -1) {
                    // Update existing maker's status
                    const updatedMakers = [...prevMakers]
                    updatedMakers[existingIndex] = {
                        ...updatedMakers[existingIndex],
                        status: makerData.status,
                        name: makerData.display_name,
                    }
                    return updatedMakers
                } else {
                    // Add new maker to the list
                    return [...prevMakers, {
                        id: makerData.id,
                        name: makerData.display_name,
                        initials: getInitials(makerData.display_name),
                        status: makerData.status,
                        external_label: makerData.external_label,
                    }]
                }
            })
        })

        // Listen for maker status updates (for future use)
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

        // Listen for maker checkout (for future use)
        newSocket.on('maker_checked_out', (data) => {
            console.log('Maker checked out:', data)
            
            setMakers((prevMakers) => {
                return prevMakers.filter(maker => maker.id !== data.id)
            })
        })

        setSocket(newSocket)

        // Cleanup on unmount
        return () => {
            newSocket.disconnect()
        }
    }, [])

    // Helper function to get initials from name
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="flex flex-row h-screen w-screen">
            <div className="flex flex-col bg-gray-50 h-screen w-[50%]">
                <Makers makers={makers} />
                <MapComponent makers={makers} />
            </div>
            <div className="flex flex-col bg-white h-screen w-[50%] overflow-y-auto">
                <Violations />
            </div>
        </div>
    )
}