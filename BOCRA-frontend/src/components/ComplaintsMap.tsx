import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Coordinates for major Botswana regions to center the markers
const REGION_COORDS: Record<string, [number, number]> = {
  'Gaborone': [-24.6282, 25.9231],
  'Francistown': [-21.1661, 27.5144],
  'Maun': [-19.9833, 23.4167],
  'Kanye': [-24.9667, 25.3333],
  'Molepolole': [-24.4167, 25.5333],
  'Serowe': [-22.3833, 26.7167],
  'Kasane': [-17.8167, 25.1500],
  'Ghanzi': [-21.5667, 21.7833],
}

interface MapProps {
  data: { region: string; complaints: number }[]
}

export default function ComplaintsMap({ data }: MapProps) {
  // Calculate the center of the map based on Botswana's center
  const center: [number, number] = [-22.3285, 24.6849]

  return (
    <MapContainer 
      center={center} 
      zoom={6} 
      className="h-full w-full z-0"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {data.map((item) => {
        const coords = REGION_COORDS[item.region] || REGION_COORDS['Gaborone']
        
        return (
          <CircleMarker
            key={item.region}
            center={coords}
            radius={Math.min(item.complaints * 5, 40)} // Size grows with complaint volume
            pathOptions={{
              fillColor: '#ef4444',
              color: '#b91c1c',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.6,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -10]} className="bg-transparent border-none shadow-none font-bold">
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