import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { FileText, MessageSquare, Clock, Users, RefreshCw, Check, X, Map as MapIcon, List, Search, Eye, Info, Calendar, Building, Mail } from 'lucide-react'
import ComplaintsMap from '@/components/ComplaintsMap'
import { cn } from '@/utils/cn'

export default function AdminDashboardPage() {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'map' | 'pending-list'>('map')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApp, setSelectedApp] = useState<any>(null) // State for the Modal

  const { data: stats, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/dashboard')
      return data.data
    }
  })

  const { data: licencesData } = useQuery({
    queryKey: ['admin-licences-all'],
    queryFn: async () => {
      const { data } = await api.get('/licences')
      return data.data
    }
  })

  const { data: complaintsData } = useQuery({
    queryKey: ['admin-map-data'],
    queryFn: async () => {
      const { data } = await api.get('/complaints')
      return data.data
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.patch(`/licences/${id}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-licences-all'] })
      setSelectedApp(null) // Close modal on action
    }
  })

  const pendingApps = licencesData?.filter((l: any) => 
    l.status?.toLowerCase() === 'pending' &&
    (l.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     l.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     l.type?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  const cards = [
    { id: 'total', title: 'Total Licences', value: stats?.totalLicences || 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'complaints', title: 'Active Complaints', value: stats?.activeComplaints || 0, icon: MessageSquare, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'pending', title: 'Pending Apps', value: stats?.pendingApps || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'users', title: 'Portal Users', value: stats?.portalUsers || 0, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
  ]

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen relative">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Analytics</h1>
          <p className="text-slate-500 mt-1 font-medium">Regulatory oversight for BOCRA Systems</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setViewMode(viewMode === 'map' ? 'pending-list' : 'map')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm text-sm font-semibold"
          >
            {viewMode === 'map' ? <List size={18} /> : <MapIcon size={18} />}
            {viewMode === 'map' ? 'View Pending List' : 'View Complaints Map'}
          </button>
          <button 
            onClick={() => refetch()}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-slate-600"
          >
            <RefreshCw className={isFetching ? 'animate-spin' : ''} size={20} />
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <button 
            key={card.id} 
            onClick={() => card.id === 'pending' && setViewMode('pending-list')}
            className={cn(
              "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all text-left relative overflow-hidden group",
              card.id === 'pending' && viewMode !== 'pending-list' && "hover:border-amber-400 hover:shadow-md ring-amber-400/20 hover:ring-4"
            )}
          >
            <div className={`inline-flex p-3 rounded-xl mb-4 ${card.bg} ${card.color}`}>
              <card.icon size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">
              {isLoading ? '...' : card.value.toLocaleString()}
            </p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[600px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">
              {viewMode === 'map' ? 'National Complaint Distribution' : 'Pending Approvals'}
            </h3>
            {viewMode === 'pending-list' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text"
                  placeholder="Search applicants..."
                  className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-slate-200 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex-1 relative">
            {viewMode === 'map' ? (
              <div className="absolute inset-0 p-4">
                <div className="h-full w-full rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                  {complaintsData ? <ComplaintsMap data={complaintsData} /> : <LoadingUI />}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 text-[11px] uppercase font-bold tracking-[0.1em] border-b border-slate-50">
                      <th className="px-8 py-4">Applicant Identity</th>
                      <th className="px-8 py-4">Category</th>
                      <th className="px-8 py-4 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pendingApps.map((app: any) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <button 
                            onClick={() => setSelectedApp(app)}
                            className="text-left hover:opacity-70 transition-opacity"
                          >
                            <p className="font-bold text-slate-900 text-sm">
                              {app.companyName || app.fullName || app.name || 'Anonymous Applicant'}
                            </p>
                            <p className="text-xs text-slate-500 font-medium lowercase">{app.email || 'no-contact@email.com'}</p>
                          </button>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-black px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase tracking-tighter">
                            {app.type || 'Standard'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => setSelectedApp(app)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'approved' })}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                              <Check size={14} strokeWidth={3} /> Approve
                            </button>
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'rejected' })}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 font-display uppercase tracking-widest text-[11px]">System Integrity</h3>
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30 p-8 text-center">
            <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-slate-300 border border-slate-100">
               <Info size={20} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">
              Awaiting Sector Data
            </p>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL OVERLAY */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-amber-100 text-amber-600`}>
                  <Clock size={32} />
                </div>
                <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {selectedApp.companyName || selectedApp.fullName || 'Licence Request'}
              </h2>
              <p className="text-slate-500 font-medium">Review application details before final approval</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Service Category</p>
                  <p className="font-bold text-slate-700 flex items-center gap-2">
                    <Building size={14} className="text-blue-500" /> {selectedApp.type || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Submission Date</p>
                  <p className="font-bold text-slate-700 flex items-center gap-2">
                    <Calendar size={14} className="text-amber-500" /> {new Date(selectedApp.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Email</p>
                  <p className="font-bold text-slate-700 flex items-center gap-2">
                    <Mail size={14} className="text-teal-500" /> {selectedApp.email || 'None provided'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Administrative Note</p>
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  Verify that all KYC documents and regulatory compliance certificates are attached before changing status.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => updateStatusMutation.mutate({ id: selectedApp.id, status: 'approved' })}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} strokeWidth={3} /> Approve Licence
              </button>
              <button 
                onClick={() => updateStatusMutation.mutate({ id: selectedApp.id, status: 'rejected' })}
                className="px-6 bg-white border border-slate-200 text-slate-400 font-bold py-3 rounded-xl hover:text-rose-600 hover:border-rose-100 transition-all"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingUI() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="animate-spin text-slate-200" size={40} />
      </div>
    </div>
  )
}