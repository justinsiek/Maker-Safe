import { useState, useMemo } from "react"
import { Map } from "lucide-react";

export default function MapLayout({ className = "", makers = [], stations = [] }) {
  const [hoveredSection, setHoveredSection] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)

  // Memoize sections to update when makers/stations change
  const sections = useMemo(() => {
    // Helper to find maker assigned to a station
    const getMakerForStation = (stationName) => {
      const station = stations.find(s => 
        s.name.toLowerCase() === stationName.toLowerCase()
      )
      if (station?.assignedMakerId) {
        return makers.find(m => m.id === station.assignedMakerId)
      }
      return makers.find(m => 
        m.stationName?.toLowerCase() === stationName.toLowerCase()
      )
    }

    // Helper to get station status
    const getStationStatus = (stationName) => {
      const station = stations.find(s => 
        s.name.toLowerCase() === stationName.toLowerCase()
      )
      return station?.status || 'idle'
    }

    return [
      {
        id: "watercutter",
        name: "Bandsaw",
        path: "M 50 50 L 200 50 L 200 220 L 50 220 Z",
        centerX: 125,
        centerY: 135,
        assignedMaker: null,
        status: 'idle',
        isStation: true,
        unavailable: true,
      },
      {
        id: "goon-station",
        name: "Water Cutter",
        path: "M 200 50 L 420 50 L 420 160 L 200 160 Z",
        centerX: 310,
        centerY: 105,
        assignedMaker: getMakerForStation("goon station"),
        status: getStationStatus("goon station"),
        isStation: true,
      },
      {
        id: "woodworking",
        name: "Woodworking",
        path: "M 420 50 L 580 50 L 580 220 L 470 220 L 420 160 Z",
        centerX: 500,
        centerY: 125,
        assignedMaker: getMakerForStation("Electronics"),
        status: getStationStatus("Electronics"),
        isStation: true,
      },
      {
        id: "storage",
        name: "Storage",
        path: "M 580 50 L 700 50 L 700 130 L 580 130 Z",
        centerX: 640,
        centerY: 90,
        assignedMaker: null,
        status: 'idle',
        isStation: false,
        isUtility: true,
      },
      {
        id: "laser-cutter",
        name: "Laser Cutter",
        path: "M 50 220 L 200 220 L 200 380 L 50 380 Z",
        centerX: 125,
        centerY: 300,
        assignedMaker: null,
        status: 'idle',
        isStation: true,
        unavailable: true,
      },
      {
        id: "community",
        name: "Community",
        path: "M 200 160 L 420 160 L 470 220 L 580 220 L 580 380 L 200 380 Z",
        centerX: 390,
        centerY: 290,
        assignedMaker: null,
        status: 'idle',
        isStation: false,
        isCommunity: true,
      },
      {
        id: "office",
        name: "Office",
        path: "M 580 130 L 700 130 L 700 220 L 580 220 Z",
        centerX: 640,
        centerY: 175,
        assignedMaker: null,
        status: 'idle',
        isStation: false,
        isUtility: true,
      },
      {
        id: "restroom",
        name: "Restroom",
        path: "M 580 220 L 700 220 L 700 380 L 580 380 Z",
        centerX: 640,
        centerY: 300,
        assignedMaker: null,
        status: 'idle',
        isStation: false,
        isUtility: true,
      },
    ]
  }, [makers, stations])

  const getSectionFill = (section) => {
    // Unavailable stations - grayed out
    if (section.unavailable) return "#d1d5db"
    
    // Community room - white
    if (section.isCommunity) return "#ffffff"
    
    // Utility rooms (storage, restroom, office) - light gray
    if (section.isUtility) return "#e5e5e5"
    
    if (selectedSection === section.id) return "#93c5fd"
    if (hoveredSection === section.id) return "#bfdbfe"
    
    // Accent color for occupied stations, red for violations
    if (section.status === 'violation') {
      return "#fecaca" // Pastel red
    }
    if (section.status === 'in_use' || section.assignedMaker) {
      return "#A100FF"
    }
    return "#F3E8FF" 
  }

  const getSectionOpacity = (section) => {
    if (section.unavailable) return 0.6
    if (hoveredSection === section.id || selectedSection === section.id) return 0.9
    return 0.7
  }

  const getStatusText = (section) => {
    if (section.unavailable) return "UNAVAILABLE"
    if (section.status === 'violation') return "VIOLATION"
    if (section.status === 'in_use' || section.assignedMaker) return "IN USE"
    return "AVAILABLE"
  }

  const getStatusColor = (section) => {
    if (section.unavailable) return "#6b7280"
    if (section.status === 'violation') return "#dc2626"
    if (section.status === 'in_use' || section.assignedMaker) return "#ffffff" // White text for occupied
    return "#16a34a"
  }

  return (
    <div className="relative w-full h-full flex flex-col px-6 min-h-0">
    <div className="flex flex-col">
      <div className="flex gap-2 mb-2">
        <Map className="w-6 h-6 text-accent" />
        <h1 className="text-xl font-semibold">Station Map</h1>
      </div>
      {/* Accent underline */}
      <div className="w-38 h-1 bg-accent rounded-full mb-3"></div>
    </div>
      <svg
        viewBox="45 45 660 340"
        preserveAspectRatio="xMidYMin meet"
        className={`${className} flex-1 min-h-0`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Community room - drawn first with no stroke, walls added separately */}
        <path
          d="M 200 160 L 420 160 L 470 220 L 580 220 L 580 380 L 200 380 Z"
          fill="#ffffff"
          fillOpacity="0.7"
          stroke="none"
        />
        <text
          x="390"
          y="294"
          textAnchor="middle"
          fontSize="12"
          fontWeight="500"
          fill="#1a1a1a"
          pointerEvents="none"
        >
          Community
        </text>
        
        {/* Interactive Sections (excluding community which is drawn above) */}
        {sections.filter(s => !s.isCommunity).map((section) => (
          <g key={section.id}>
            <path
              d={section.path}
              fill={getSectionFill(section)}
              fillOpacity={getSectionOpacity(section)}
              stroke="#9ca3af"
              strokeWidth="2.5"
              className={section.isStation && !section.unavailable ? "cursor-pointer transition-all duration-200" : ""}
              onMouseEnter={() => section.isStation && !section.unavailable && setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => section.isStation && !section.unavailable && setSelectedSection(section.id === selectedSection ? null : section.id)}
            />
            
            {/* Section Label */}
            {section.name && (
              <text
                x={section.centerX}
                y={section.isStation ? section.centerY - 12 : section.centerY + 4}
                textAnchor="middle"
                fontSize={section.isUtility ? "11" : "13"}
                fontWeight="500"
                fill={
                  section.unavailable
                    ? "#6b7280"
                    : section.isUtility 
                      ? "#737373" 
                      : (section.status === 'in_use' || section.assignedMaker) 
                        ? "#ffffff" 
                        : "#1a1a1a"
                }
                pointerEvents="none"
              >
                {section.name}
              </text>
            )}
            
            {/* Status - only for stations */}
            {section.isStation && (
              <text
                x={section.centerX}
                y={section.centerY + 6}
                textAnchor="middle"
                fontSize="10"
                fill={getStatusColor(section)}
                fontWeight="600"
                pointerEvents="none"
              >
                {getStatusText(section)}
              </text>
            )}
            
            {/* Maker Info - don't show for unavailable */}
            {section.assignedMaker && !section.unavailable && (
              <text
                x={section.centerX}
                y={section.centerY + 22}
                textAnchor="middle"
                fontSize="10"
                fill="#ffffff"
                fontWeight="400"
                pointerEvents="none"
              >
                {section.assignedMaker.name}
              </text>
            )}
          </g>
        ))}
        
        {/* Additional walls for community area */}
        <line x1="200" y1="220" x2="200" y2="380" stroke="#9ca3af" strokeWidth="2.5" />
        <line x1="200" y1="380" x2="580" y2="380" stroke="#9ca3af" strokeWidth="2.5" />
        <line x1="580" y1="220" x2="580" y2="380" stroke="#9ca3af" strokeWidth="2.5" />
        <line x1="420" y1="160" x2="470" y2="220" stroke="#9ca3af" strokeWidth="2.5" />
        <line x1="470" y1="220" x2="580" y2="220" stroke="#9ca3af" strokeWidth="2.5" />
        
        {/* Outer boundary */}
        <rect 
          x="50" 
          y="50" 
          width="650" 
          height="330" 
          fill="none" 
          stroke="#1a1a1a" 
          strokeWidth="3"
        />
      </svg>
    </div>
  )
}
