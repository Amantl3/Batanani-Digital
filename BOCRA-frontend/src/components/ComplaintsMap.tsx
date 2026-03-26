import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const REGION_COORDS: Record<string, [number, number]> = {
  Gaborone: [-24.6282, 25.9231],
  Francistown: [-21.1661, 27.5144],
  Maun: [-19.9833, 23.4167],
  Kanye: [-24.9667, 25.3333],
  Molepolole: [-24.4167, 25.5333],
  Serowe: [-22.3833, 26.7167],
  Kasane: [-17.8167, 25.15],
  Ghanzi: [-21.5667, 21.7833],
  Mochudi: [-24.4667, 26.1333],
}

interface MapProps {
  data: { id?: string; region: string; complaints: number; color: string }[]
  onRegionSelect?: (region: string) => void
}

export default function ComplaintsMap({ data, onRegionSelect }: MapProps) {
  const center: [number, number] = [-22.3285, 24.6849] // approximate center of Botswana
  const topComplaints = Math.max(...data.map(d => d.complaints))

  return (
    <MapContainer
      center={center}
      zoom={6}
      className="h-full w-full rounded-xl overflow-hidden"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {data.map((item, index) => {
        const coords = REGION_COORDS[item.region] || REGION_COORDS['Gaborone']
        const radius = 10 + (item.complaints / topComplaints) * 20 // proportional size
        const uniqueKey = item.id || `${item.region}-${index}`

        return (
          <CircleMarker
            key={uniqueKey}
            center={coords}
            radius={radius}
            pathOptions={{
              fillColor: item.color,
              color: item.color,
              weight: 2,
              opacity: 1,
              fillOpacity: 0.6,
            }}
            eventHandlers={{
              click: () => onRegionSelect?.(item.region),
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -10]} className="bg-transparent border-none shadow-none font-bold text-slate-900">
              {item.complaints}
            </Tooltip>
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-slate-900">{item.region}</h4>
                <p className="text-sm text-slate-600">{item.complaints} Active Complaints</p>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}