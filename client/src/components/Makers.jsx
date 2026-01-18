import { Users } from "lucide-react";
export default function Makers({ makers = [] }) {

  const getStatusColor = (status) => {
    switch(status) {
      case "active":
      case "on duty":
        return "bg-accent";
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
        return "border-accent bg-accent-50";
      case "idle":
        return "border-gray-400 bg-gray-50";
      case "violation":
        return "border-red-500 bg-red-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  return (
    <div className="flex flex-col px-6 shrink-0 h-1/4 my-4 rounded-lg py-4 bg-surface">
        <div className="flex gap-2 ">
          <Users className="w-6 h-6 text-accent" />
          <h1 className="text-xl font-semibold mb-3">Active Makers</h1>
        </div>
        <div className="flex w-full gap-4 overflow-x-auto overflow-y-hidden">
          {makers.length === 0 ? (
            <p className="text-neutral-500">No makers checked in</p>
          ) : (
            makers.map((maker) => (
              <div 
                key={maker.id}
                className={`h-full py-3 px-10 flex flex-row items-center gap-4 rounded-xl border-2 shrink-0 ${getCardStyles(maker.status)}`}
              >
                {/* Avatar */}
                <div className={`${getStatusColor(maker.status)} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base shrink-0`}>
                  {maker.initials}
                </div>
                
                {/* Name and Status */}
                <div className="flex flex-col justify-center">
                  <h3 className="text-sm font-medium text-neutral-900 leading-tight">
                    {maker.name}
                  </h3>
                  <span className={`mt-1 px-2 py-0.5 rounded text-white text-xs font-medium w-fit ${getStatusColor(maker.status)}`}>
                    {maker.status}
                  </span>
                  {maker.stationName && (
                    <span className="text-xs text-neutral-500 font-normal mt-1">
                      @ {maker.stationName}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
      </div>

    </div>
  );
}


