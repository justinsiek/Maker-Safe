import { useState, useMemo } from "react"

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
        id: "woodworking",
        name: "Woodworking",
        path: "M 50 50 L 200 50 L 200 220 L 50 220 Z",
        centerX: 125,
        centerY: 135,
        assignedMaker: getMakerForStation("Woodworking"),
        status: getStationStatus("Woodworking"),
        isStation: true,
      },
      {
        id: "goon-station",
        name: "goon station",
        path: "M 200 50 L 420 50 L 420 160 L 200 160 Z",
        centerX: 310,
        centerY: 105,
        assignedMaker: getMakerForStation("goon station"),
        status: getStationStatus("goon station"),
        isStation: true,
      },
      {
        id: "electronics",
        name: "Electronics",
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
        assignedMaker: getMakerForStation("Laser Cutter"),
        status: getStationStatus("Laser Cutter"),
        isStation: true,
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
    // Community room - white
    if (section.isCommunity) return "#ffffff"
    
    // Utility rooms (storage, restroom, office) - light gray
    if (section.isUtility) return "#e5e5e5"
    
    if (selectedSection === section.id) return "#93c5fd"
    if (hoveredSection === section.id) return "#bfdbfe"
    
    // Pastel colors based on status for stations
    if (section.status === 'violation') {
      return "#fecaca" // Pastel red
    }
    if (section.status === 'in_use' || section.assignedMaker) {
      return "#fef08a" // Pastel yellow
    }
    return "#bbf7d0" // Pastel green
  }

  const getSectionOpacity = (section) => {
    if (hoveredSection === section.id || selectedSection === section.id) return 0.9
    return 0.7
  }

  const getStatusText = (section) => {
    if (section.status === 'violation') return "VIOLATION"
    if (section.status === 'in_use' || section.assignedMaker) return "IN USE"
    return "AVAILABLE"
  }

  const getStatusColor = (section) => {
    if (section.status === 'violation') return "#dc2626"
    if (section.status === 'in_use' || section.assignedMaker) return "#ca8a04"
    return "#16a34a"
  }

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 750 430"
        className={className}
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
          fontSize="14"
          fontWeight="600"
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
              stroke="#1a1a1a"
              strokeWidth="2.5"
              className={section.isStation ? "cursor-pointer transition-all duration-200" : ""}
              onMouseEnter={() => section.isStation && setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => section.isStation && setSelectedSection(section.id === selectedSection ? null : section.id)}
            />
            
            {/* Section Label */}
            {section.name && (
              <text
                x={section.centerX}
                y={section.isStation ? section.centerY - 12 : section.centerY + 4}
                textAnchor="middle"
                fontSize={section.isUtility ? "11" : "14"}
                fontWeight="600"
                fill={section.isUtility ? "#737373" : "#1a1a1a"}
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
            
            {/* Maker Info */}
            {section.assignedMaker && (
              <text
                x={section.centerX}
                y={section.centerY + 22}
                textAnchor="middle"
                fontSize="10"
                fill="#525252"
                pointerEvents="none"
              >
                {section.assignedMaker.name}
              </text>
            )}
          </g>
        ))}
        
        {/* Additional walls for community area */}
        {/* Left wall of community (from bottom of woodworking down) */}
        <line x1="200" y1="220" x2="200" y2="380" stroke="#1a1a1a" strokeWidth="2.5" />
        {/* Bottom wall of community */}
        <line x1="200" y1="380" x2="580" y2="380" stroke="#1a1a1a" strokeWidth="2.5" />
        {/* Right wall of community (partial, from electronics bottom to office) */}
        <line x1="580" y1="220" x2="580" y2="380" stroke="#1a1a1a" strokeWidth="2.5" />
        {/* Diagonal wall from electronics to community */}
        <line x1="420" y1="160" x2="470" y2="220" stroke="#1a1a1a" strokeWidth="2.5" />
        {/* Top-right wall of community (from diagonal to office) */}
        <line x1="470" y1="220" x2="580" y2="220" stroke="#1a1a1a" strokeWidth="2.5" />
        
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
      
      {/* Hover Tooltip */}
      {hoveredSection && (
        <div className="absolute top-4 right-4 bg-white border border-neutral-200 rounded-lg p-4 shadow-lg z-10">
          <h3 className="font-semibold text-lg mb-2">
            {sections.find(s => s.id === hoveredSection)?.name}
          </h3>
          {(() => {
            const section = sections.find(s => s.id === hoveredSection)
            if (section?.status === 'violation') {
              return (
                <div>
                  <p className="text-red-600 font-semibold mb-1">⚠️ Violation</p>
                  {section.assignedMaker && (
                    <p className="text-neutral-600">
                      Maker: <span className="font-semibold">{section.assignedMaker.name}</span>
                    </p>
                  )}
                </div>
              )
            }
            if (section?.status === 'in_use' || section?.assignedMaker) {
              return (
                <div>
                  <p className="text-yellow-600 font-semibold mb-1">🔶 In Use</p>
                  {section.assignedMaker && (
                    <p className="text-neutral-600">
                      Maker: <span className="font-semibold">{section.assignedMaker.name}</span>
                    </p>
                  )}
                </div>
              )
            }
            return (
              <div>
                <p className="text-green-600 font-semibold">✅ Available</p>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
