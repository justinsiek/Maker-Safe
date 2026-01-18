import { useState } from "react"
import { AlertTriangle, X, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Megaphone } from "lucide-react"

export default function SafetyAlerts() {
  const demoAlerts = [
    "Equipment maintenance due for Laser Cutter",
    // "Machine temperature warning at 3D Printer station",
    "Station offline: Soldering Iron equipment not responding",
  ]

  const [alerts, setAlerts] = useState(
    demoAlerts.map((message, index) => ({
      id: index,
      message,
      type: Math.random() > 0.5 ? "warning" : "critical",
      timestamp: new Date(),
    }))
  )
  const [soundEnabled, setSoundEnabled] = useState(true)

  const dismissAlert = (id) => {
    setAlerts(alerts.filter((a) => a.id !== id))
  }

  if (alerts.length === 0) return null

  return (
    <div className="flex flex-col h-1/3 rounded-lg px-6 py-4 bg-surface">
      <div className="flex flex-col mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            <Megaphone className="w-6 h-6 text-[#A100FF]" />
            <h1 className="text-xl font-semibold">Live Announcements</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 w-8 p-0"
          >
          </Button>
        </div>
        {/* Accent underline */}
        <div className="w-62 h-1 bg-[#A100FF] rounded-full"></div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-4 rounded-lg bg-white animate-in slide-in-from-top-2"
            >
              <AlertTriangle
                className="w-4 h-4 mt-0.5 shrink-0 text-[#A100FF]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">{alert.message}</p>
                <p className="text-xs text-neutral-500 font-normal mt-1">
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(alert.id)}
                className="h-6 w-6 p-0 shrink-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}