import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, CheckCircle, XCircle, ExternalLink, Download } from 'lucide-react'
import toast from 'react-hot-toast'

import * as adminService from '@/services/admin'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'

export default function AdminApplicationsPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'applications', searchTerm],
    queryFn: () => adminService.getAllApplications({ q: searchTerm })
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      adminService.updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
      toast.success('Status updated successfully')
    },
    onError: () => toast.error('Failed to update status')
  })

  const handleStatusUpdate = (id: string, status: string) => {
    if (window.confirm(`Set application to ${status.toUpperCase()}?`)) {
      updateStatusMutation.mutate({ id, status })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navy Hero Section + Breadcrumb (from complaints page) */}
      <section className="bg-bocra-navy py-10">
        <div className="container-page">
          <nav className="breadcrumb mb-3">
            <Link to="/admin/dashboard" className="breadcrumb-link">Admin</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Applications</span>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Licence Applications</h1>
              <p className="mt-1 text-slate-400">
                Review, approve, and manage all submitted licence applications
              </p>
            </div>

            <div className="flex gap-2">
              <button 
                className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-page py-8">
        <div className="flex flex-wrap gap-3 items-center mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by company or reference..."
              className="form-input pl-9 text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-sm font-semibold text-slate-600">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500">
                    Loading applications...
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    No applications found
                  </td>
                </tr>
              ) : (
                data?.data?.map((app: any) => (
                  <tr key={app.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium">{app.holderName}</td>
                    <td className="px-6 py-4 text-sm capitalize">{app.category}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        app.status === 'active' ? "bg-green-100 text-green-700" : 
                        app.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                        "bg-amber-100 text-amber-700"
                      )}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {app.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'active')} 
                            className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'rejected')} 
                            className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle size={20} />
                          </button>
                        </>
                      )}
                      <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors" title="View details">
                        <ExternalLink size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {data?.data?.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">
              Showing {data.data.length} applications
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
