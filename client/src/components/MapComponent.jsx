import MapLayout from "./MapLayout.jsx"

export default function MapComponent({ makers = [], stations = [] }) {
    return (
        <div className="flex w-full overflow-hidden border  p-4 rounded-xl">
            <MapLayout className="w-full h-full" makers={makers} stations={stations} />
        </div>
    )
}


