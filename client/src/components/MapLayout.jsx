import { useState } from "react"

export default function MapLayout({ className = "", makers = [] }) {
  const [hoveredSection, setHoveredSection] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)

  // Define the 3 sections with their assignments
  const sections = [
    {
      id: "workshop-a",
      name: "Workshop A",
      path: "M 50 50 L 350 50 L 350 300 L 50 300 Z",
      centerX: 200,
      centerY: 175,
      assignedMaker: makers.find(m => m.name === "Sarah Johnson"),
    },
    {
      id: "workshop-b",
      name: "Workshop B",
      path: "M 350 50 L 750 50 L 750 300 L 350 300 Z",
      centerX: 550,
      centerY: 175,
      assignedMaker: makers.find(m => m.name === "Mike Chen"),
    },
    {
      id: "assembly",
      name: "Assembly Area",
      path: "M 50 300 L 750 300 L 750 550 L 50 550 Z",
      centerX: 400,
      centerY: 425,
      assignedMaker: null, // Available
    },
  ]

  const getSectionColor = (section) => {
    if (selectedSection === section.id) return "#3b82f6"
    if (hoveredSection === section.id) return "#60a5fa"
    return section.assignedMaker ? "#e5e7eb" : "#d1fae5"
  }

  const getSectionOpacity = (section) => {
    if (hoveredSection === section.id || selectedSection === section.id) return 0.6
    return 0.3
  }

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 800 600"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="800" height="600" fill="#f5f5f5" />
        
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="800" height="600" fill="url(#grid)" />
        
        {/* Interactive Sections */}
        {sections.map((section) => (
          <g key={section.id}>
            <path
              d={section.path}
              fill={getSectionColor(section)}
              fillOpacity={getSectionOpacity(section)}
              stroke="#404040"
              strokeWidth="4"
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => setSelectedSection(section.id === selectedSection ? null : section.id)}
            />
            
            {/* Section Label */}
            <text
              x={section.centerX}
              y={section.centerY - 20}
              textAnchor="middle"
              fontSize="20"
              fontWeight="bold"
              fill="#404040"
              pointerEvents="none"
            >
              {section.name}
            </text>
            
            {/* Status */}
            <text
              x={section.centerX}
              y={section.centerY + 10}
              textAnchor="middle"
              fontSize="16"
              fill={section.assignedMaker ? "#ef4444" : "#22c55e"}
              fontWeight="600"
              pointerEvents="none"
            >
              {section.assignedMaker ? "OCCUPIED" : "AVAILABLE"}
            </text>
            
            {/* Maker Info */}
            {section.assignedMaker && (
              <text
                x={section.centerX}
                y={section.centerY + 35}
                textAnchor="middle"
                fontSize="14"
                fill="#666"
                pointerEvents="none"
              >
                {section.assignedMaker.name}
              </text>
            )}
          </g>
        ))}
        
        {/* Interior Walls */}
        <line x1="350" y1="50" x2="350" y2="300" stroke="#404040" strokeWidth="8" />
        <line x1="50" y1="300" x2="750" y2="300" stroke="#404040" strokeWidth="8" />
        
        {/* Outer boundary */}
        <rect 
          x="50" 
          y="50" 
          width="700" 
          height="500" 
          fill="none" 
          stroke="#404040" 
          strokeWidth="8"
        />
      </svg>
      
      {/* Hover Tooltip */}
      {hoveredSection && (
        <div className="absolute top-4 right-4 bg-white border-2 border-neutral-300 rounded-lg p-4 shadow-lg">
          <h3 className="font-bold text-lg mb-2">
            {sections.find(s => s.id === hoveredSection)?.name}
          </h3>
          {sections.find(s => s.id === hoveredSection)?.assignedMaker ? (
            <div>
              <p className="text-red-600 font-semibold mb-1">🔴 Occupied</p>
              <p className="text-neutral-700">
                Assigned to: <span className="font-semibold">
                  {sections.find(s => s.id === hoveredSection)?.assignedMaker.name}
                </span>
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Status: {sections.find(s => s.id === hoveredSection)?.assignedMaker.status}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-green-600 font-semibold">✅ Available</p>
              <p className="text-neutral-600 text-sm">Click to assign a maker</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}