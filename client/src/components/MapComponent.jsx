import MapLayout from "./MapLayout.jsx"

export default function MapComponent({ makers = [], stations = [] }) {
    return (
        <div className="bg-white flex-1 min-h-0 overflow-hidden">
            <MapLayout className="w-full h-full" makers={makers} stations={stations} />
        </div>
    )
}