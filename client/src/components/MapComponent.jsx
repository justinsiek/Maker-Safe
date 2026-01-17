import MapLayout from "./MapLayout.jsx"

export default function MapComponent({ makers = [] }) {
    return (
        <div className="p-8 bg-white h-1/2">
            <MapLayout className="w-full h-full" makers={makers} />
        </div>
    )
}