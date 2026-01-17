import { motion } from "framer-motion"

export default function Makers({ makers = [] }) {

  const getStatusColor = (status) => {
    switch(status) {
      case "active":
      case "on duty":
        return "bg-blue-500";
      case "idle":
        return "bg-gray-400";
      case "violation":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const getCardStyles = (status) => {
    switch(status) {
      case "active":
      case "on duty":
        return "border-blue-500 bg-blue-50";
      case "idle":
        return "border-gray-400 bg-gray-50";
      case "violation":
        return "border-red-500 bg-red-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  return (
    <div className="p-8 flex-shrink-0">
      <h1 className="text-3xl font-light mb-6">Makers</h1>
      <div className="flex flex-wrap gap-4 overflow-y-auto max-h-[40vh]">
        {makers.length === 0 ? (
          <p className="text-neutral-500">No makers checked in</p>
        ) : (
          makers.map((maker) => (
            <div className={`w-48 h-60 py-5 px-4 flex flex-col items-center rounded-xl border-3 ${getCardStyles(maker.status)}`}>
              {/* Avatar */}
              <div className={`${getStatusColor(maker.status)} w-20 h-20 rounded-full flex items-center justify-center text-white font-medium text-xl mb-3`}>
                {maker.initials}
              </div>
              
              {/* Info */}
              <h3 className="text-xl font-light text-neutral-900 text-center leading-tight mb-2">
                {maker.name}
              </h3>
              <span className={`px-3 py-1 rounded text-white text-sm font-medium ${getStatusColor(maker.status)}`}>
                {maker.status}
              </span>
              {/* Always reserve space for station name */}
              <span className="text-sm text-neutral-500 mt-2 text-center h-5">
                {maker.stationName ? `@ ${maker.stationName}` : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
