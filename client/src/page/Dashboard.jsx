import Makers from '../components/Makers.jsx'
import Violations from '../components/Violation.jsx'
import MapComponent from '../components/MapComponent.jsx'

export default function Dashboard() {
    // Sample makers data - you can replace this with real data
    const makers = [
        { id: 1, name: "Sarah Johnson", initials: "SJ", status: "active" },
        { id: 2, name: "Mike Chen", initials: "MC", status: "active" },
        { id: 3, name: "Emily Rodriguez", initials: "ER", status: "break" },
        { id: 4, name: "David Kim", initials: "DK", status: "active" },
    ]

    return (
        <div className="flex flex-row h-screen w-screen">
            <div className="flex flex-col bg-gray-50 h-screen w-[50%]">
                <Makers makers={makers}/>
                <MapComponent makers={makers} />
            </div>
            <div className="flex flex-col bg-white h-screen w-[50%] overflow-y-auto">
                <Violations />
            </div>
        </div>
    )
}