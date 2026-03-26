import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { FileText, MessageSquare, Clock, Users, RefreshCw } from 'lucide-react'
import ComplaintsMap from '@/components/ComplaintsMap'

export default function AdminDashboardPage() {
  // 1. Fetch the KPI counts (The 4 cards)
  const { data: stats, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/dashboard')
      return data.data
    }
  })

  // 2. Fetch the complaints for the Map pins
  const { data: complaintsData } = useQuery({
    queryKey: ['admin-map-data'],
    queryFn: async () => {
      const { data } = await api.get('/complaints')
      return data.data
    }
  })

  const cards = [
    { 
      title: 'Total Licences', 
      value: stats?.totalLicences || 0, 
      icon: FileText, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      delta: stats?.licenceDelta 
    },
    { 
      title: 'Active Complaints', 
      value: stats?.activeComplaints || 0, 
      icon: MessageSquare, 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      delta: stats?.complaintDelta 
    },
    { 
      title: 'Pending Apps', 
      value: stats?.pendingApps || 0, 
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
    { 
      title: 'Portal Users', 
      value: stats?.portalUsers || 0, 
      icon: Users, 
      color: 'text-teal-600', 
      bg: 'bg-teal-50',
      delta: stats?.userDelta 
    },
  ]

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Analytics</h1>
          <p className="text-slate-500 mt-1">Real-time regulatory oversight of BOCRA systems</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm font-medium"
        >
          <RefreshCw className={isFetching ? 'animate-spin' : ''} size={18} />
          {isFetching ? 'Syncing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon size={24} />
              </div>
              {card.delta !== undefined && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${card.delta > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {card.delta > 0 ? '↑' : '↓'} {Math.abs(card.delta)}%
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              {isLoading ? '---' : card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map - Takes up 2/3 of the width */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[550px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">National Complaint Distribution</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full border font-medium">Live Feed</span>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden border border-slate-100 relative bg-slate-50">
             {complaintsData ? (
               <ComplaintsMap data={complaintsData} />
             ) : (
               <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm">
                 <div className="flex flex-col items-center gap-3">
                   <RefreshCw className="animate-spin text-blue-500" size={32} />
                   <p className="text-slate-400 font-medium">Loading geospatial data...</p>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Market Share / Sector Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Market Share by Sector</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/30">
            <p className="text-slate-400 text-sm italic text-center px-4">
              Sector breakdown visualization will populate as data grows
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}