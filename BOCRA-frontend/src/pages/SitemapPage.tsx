import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Users, Building2, Navigation } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/utils/cn'
import { Plus, Minus, Layers } from 'lucide-react'

// Fix default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

function InView({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Map controls component
function MapControls() {
  const map = useMap()

  return (
    <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
      <button
        onClick={() => map.zoomIn()}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
        title="Zoom in"
      >
        <Plus className="h-5 w-5 text-gray-700" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
        title="Zoom out"
      >
        <Minus className="h-5 w-5 text-gray-700" />
      </button>
      <button
        onClick={() => map.setView([-22.3285, 24.6849], 7)}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
        title="Reset view"
      >
        <Layers className="h-5 w-5 text-gray-700" />
      </button>
    </div>
  )
}

// Center map on selected location
function MapCenter({ position }: { position: [number, number] }) {
  const map = useMap()
  map.setView(position, 8)
  return null
}

const LOCATIONS = [
  {
    name: 'Head Office - Gaborone',
    region: 'South East',
    address: 'Plot 50671 Independence Ave, Gaborone, South-East District 9999',
    phone: '+267 395 7755',
    email: 'info@bocra.org.bw',
    hours: 'Mon-Fri: 8AM-5PM',
    services: ['Licensing', 'Complaints', 'Domain Registry', 'Compliance'],
    coordinates: [-24.6282, 25.9165] as [number, number],
    type: 'primary',
  },
]

// Custom marker colors
function getMarkerIcon(type: string) {
  const color =
    type === 'primary'
      ? '#dc2626'
      : type === 'secondary'
      ? '#d97706'
      : '#2563eb'

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${
      type === 'primary'
        ? 'red'
        : type === 'secondary'
        ? 'orange'
        : 'blue'
    }.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

export default function SitemapPage() {
  const [selectedLocation, setSelectedLocation] = useState<(typeof LOCATIONS)[0] | null>(LOCATIONS[0])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-bocra-navy px-6 py-16">
        <InView className="container-page text-center">
          <motion.div variants={fadeUp} className="mx-auto max-w-2xl">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">BOCRA Office Locations</h1>
            <p className="text-xl text-slate-300">Find our offices across Botswana and discover regional services</p>
          </motion.div>
        </InView>
      </section>

      <div className="container-page py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Map Section */}
          <InView className="lg:col-span-2">
            <motion.div variants={fadeUp} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-8 py-4">
                <h2 className="text-2xl font-bold text-gray-900">South East Region</h2>
              </div>
              
              {/* Leaflet Map */}
              <div className="h-96 md:h-[500px]">
                <MapContainer
                  center={[-22.3285, 24.6849]}
                  zoom={7}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {selectedLocation && <MapCenter position={selectedLocation.coordinates} />}
                  
                  {LOCATIONS.map((location, i) => (
                    <Marker
                      key={i}
                      position={location.coordinates}
                      icon={getMarkerIcon(location.type)}
                      eventHandlers={{
                        click: () => setSelectedLocation(location),
                      }}
                    >
                      <Popup>
                        <div className="max-w-xs">
                          <h3 className="font-bold text-gray-900">{location.name}</h3>
                          <p className="text-sm text-gray-600">{location.address}</p>
                          <a href={`tel:${location.phone}`} className="text-sm text-bocra-teal hover:underline">
                            {location.phone}
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 border-t border-slate-200 bg-slate-50 px-8 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-600"></div>
                  <span className="text-sm font-medium text-gray-700">Head Office</span>
                </div>
              </div>
            </motion.div>
          </InView>

          {/* Info Panel */}
          <InView>
            <motion.div variants={fadeUp} className="space-y-4">
              {selectedLocation && (
                <motion.div
                  key={selectedLocation.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sticky top-20 space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start gap-3">
                    <div
                      className={cn(
                        'rounded-lg p-3',
                        selectedLocation.type === 'primary'
                          ? 'bg-red-100'
                          : selectedLocation.type === 'secondary'
                          ? 'bg-amber-100'
                          : 'bg-blue-100'
                      )}
                    >
                      <MapPin
                        className={cn(
                          'h-6 w-6',
                          selectedLocation.type === 'primary'
                            ? 'text-red-600'
                            : selectedLocation.type === 'secondary'
                            ? 'text-amber-600'
                            : 'text-blue-600'
                        )}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{selectedLocation.name}</h3>
                      <p className="text-sm text-gray-600">{selectedLocation.region}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Address */}
                    <div className="flex gap-3">
                      <Building2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-900">{selectedLocation.address}</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex gap-3">
                      <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a
                          href={`tel:${selectedLocation.phone}`}
                          className="font-medium text-bocra-teal hover:underline"
                        >
                          {selectedLocation.phone}
                        </a>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex gap-3">
                      <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a
                          href={`mailto:${selectedLocation.email}`}
                          className="break-all text-sm font-medium text-bocra-teal hover:underline"
                        >
                          {selectedLocation.email}
                        </a>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex gap-3">
                      <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                      <div>
                        <p className="text-sm text-gray-600">Business Hours</p>
                        <p className="font-medium text-gray-900">{selectedLocation.hours}</p>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="flex gap-3">
                      <Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                      <div className="flex-1">
                        <p className="mb-2 text-sm text-gray-600">Services</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedLocation.services.map((service, i) => (
                            <span
                              key={i}
                              className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigate button */}
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(selectedLocation.address + ', Botswana')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-bocra-teal py-2 px-4 font-medium text-white transition-colors hover:bg-bocra-teal/90"
                  >
                    <Navigation className="h-4 w-4" />
                    Get Directions
                  </a>
                </motion.div>
              )}

              {/* Location List */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h3 className="mb-4 font-semibold text-gray-900">All Offices</h3>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {LOCATIONS.map((location, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedLocation(location)}
                      className={cn(
                        'w-full rounded-lg border p-3 text-left transition-all',
                        selectedLocation?.name === location.name
                          ? 'border-bocra-teal bg-bocra-teal/10'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <p className="text-sm font-medium text-gray-900">{location.name}</p>
                      <p className="text-xs text-gray-600">{location.region}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </InView>
        </div>
      </div>
    </div>
  )
}
