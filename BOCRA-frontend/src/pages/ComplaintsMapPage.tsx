import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, TrendingUp, Users, AlertTriangle, RefreshCw, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import ComplaintsMap from '@/components/ComplaintsMap'
import { cn } from '@/utils/cn'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const scaleIn = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.3 } } }

interface RegionData {
  region: string
  complaints: number
  trend: string
  color: string
}

export default function ComplaintsMapPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const mockData: RegionData[] = [
    { region: 'Gaborone', complaints: 245, trend: '+12%', color: '#ef4444' },
    { region: 'Francistown', complaints: 156, trend: '+8%', color: '#f97316' },
    { region: 'Maun', complaints: 89, trend: '+3%', color: '#eab308' },
    { region: 'Serowe', complaints: 67, trend: '-2%', color: '#22c55e' },
    { region: 'Kanye', complaints: 43, trend: '+5%', color: '#3b82f6' },
    { region: 'Mochudi', complaints: 38, trend: '+1%', color: '#8b5cf6' },
  ]

  const totalComplaints = mockData.reduce((sum, region) => sum + region.complaints, 0)
  const avgComplaints = Math.round(totalComplaints / mockData.length)
  const topRegion = mockData.reduce((prev, current) => prev.complaints > current.complaints ? prev : current)

  const legendItems = [
    { label: 'High Activity', color: '#ef4444', range: '200+' },
    { label: 'Medium Activity', color: '#f97316', range: '100-199' },
    { label: 'Low Activity', color: '#eab308', range: '50-99' },
    { label: 'Minimal Activity', color: '#22c55e', range: '0-49' },
  ]

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const exportDate = new Date()

      const csvLines = [
        'BOCRA COMPLAINTS ANALYTICS - DATA EXPORT',
        `Exported: ${exportDate.toLocaleString()}`,
        `Total Regions: ${mockData.length}`,
        `Total Complaints: ${totalComplaints}`,
        `Average per Region: ${avgComplaints}`,
        '',
        'REGIONAL BREAKDOWN',
        'Region,Number of Complaints,Trend (%)',
      ]

      mockData.forEach(region => {
        csvLines.push(`"${region.region}",${region.complaints},"${region.trend}"`)
      })

      csvLines.push('')
      csvLines.push('SUMMARY STATISTICS')
      csvLines.push(`Top Region,"${topRegion.region}",${topRegion.complaints} complaints`)
      csvLines.push(`Data Points,${mockData.length} regions`)
      csvLines.push(`Report Generated,${exportDate.toISOString()}`)

      const csvContent = csvLines.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `complaints-data-${exportDate.toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`📊 Data exported: ${totalComplaints} complaints across ${mockData.length} regions`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20"
    >
      {/* Hero Section */}
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-bocra-navy via-bocra-teal to-bocra-navy/90 text-white">
        <div className="container-page py-12">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Complaints Analytics</h1>
                  <p className="text-xl text-white/80">Interactive heatmap of service complaints across Botswana</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Live data updated hourly
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container-page py-8">
        {/* Stats Cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div variants={scaleIn} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                <p className="text-3xl font-bold text-gray-900">{totalComplaints.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4" />
                  +12% from last month
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={scaleIn} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average per Region</p>
                <p className="text-3xl font-bold text-gray-900">{avgComplaints}</p>
                <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                  <Users className="w-4 h-4" />
                  Across {mockData.length} regions
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={scaleIn} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Region</p>
                <p className="text-3xl font-bold text-gray-900">{topRegion.region}</p>
                <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4" />
                  {topRegion.complaints} complaints
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Map Section */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Interactive Heatmap</h2>
                <p className="text-gray-600">Click on regions to view detailed complaint data</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Real-time data
              </div>
            </div>
          </div>
          <div className="p-6">
            <ComplaintsMap data={mockData} onRegionSelect={setSelectedRegion} />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Legend */}
          <motion.div variants={fadeUp} className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Levels</h3>
              <div className="space-y-3">
                {legendItems.map((item) => (
                  <motion.div
                    key={item.label}
                    variants={scaleIn}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {item.range}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Region Details */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockData.map((region) => (
                  <motion.div
                    key={region.region}
                    variants={scaleIn}
                    className={cn(
                      'p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md',
                      selectedRegion === region.region
                        ? 'border-bocra-teal bg-bocra-teal/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() => setSelectedRegion(region.region)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{region.region}</h4>
                      <span
                        className={cn(
                          'text-xs px-2 py-1 rounded-full font-medium',
                          region.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        )}
                      >
                        {region.trend}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{region.complaints}</span>
                      <span className="text-sm text-gray-600">complaints</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(region.complaints / topRegion.complaints) * 100}%`,
                            backgroundColor: region.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
