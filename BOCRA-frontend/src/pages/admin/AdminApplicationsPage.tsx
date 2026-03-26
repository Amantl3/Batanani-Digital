import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react'
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
      toast.success('Status updated')
    },
    onError: () => toast.error('Update failed')
  })

  const handleStatusUpdate = (id: string, status: string) => {
    if (window.confirm(`Set application to ${status.toUpperCase()}?`)) {
      updateStatusMutation.mutate({ id, status })
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Licence Applications</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border rounded-xl outline-none w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
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
              <tr><td colSpan={4} className="p-10 text-center">Loading...</td></tr>
            ) : data?.data?.map((app: any) => (
              <tr key={app.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium">{app.holderName}</td>
                <td className="px-6 py-4 text-sm">{app.category}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold",
                    app.status === 'active' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {app.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  {app.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusUpdate(app.id, 'active')} className="text-green-600 p-1 hover:bg-green-50 rounded"><CheckCircle size={20}/></button>
                      <button onClick={() => handleStatusUpdate(app.id, 'rejected')} className="text-red-600 p-1 hover:bg-red-50 rounded"><XCircle size={20}/></button>
                    </>
                  )}
                  <button className="text-slate-400 p-1"><ExternalLink size={20}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}