import { Card } from "./ui/card.jsx"
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

  return (
    <div className="p-8 bg-gray-50 h-1/2">
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Makers in Shop</h1>
      
      <div className="flex flex-col gap-4 overflow-y-auto h-[80%]">
        {makers.length === 0 ? (
          <p className="text-neutral-500">No makers checked in</p>
        ) : (
          makers.map((maker) => (
            <motion.div
              key={maker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="px-4 py-2">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`${getStatusColor(maker.status)} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                    {maker.initials}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900">{maker.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-block px-3 py-1 rounded text-white text-sm font-medium ${getStatusColor(maker.status)}`}>
                        {maker.status}
                      </span>
                      {maker.stationName && (
                        <span className="text-sm text-neutral-500">
                          @ {maker.stationName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}