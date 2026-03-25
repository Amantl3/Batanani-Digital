/**
 * src/hooks/useLicences.ts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import * as licenceService from '@/services/licences'
import type { ApplyPayload } from '@/services/licences'

interface LicenceFilters {
  [key: string]: unknown
}

export function useLicences(filters: LicenceFilters = {}) {
  return useQuery({
    queryKey:        ['licences', filters],
    queryFn:         () => licenceService.getLicences(filters),
    staleTime:       1000 * 60 * 5,
    placeholderData: (prev: any) => prev,
  })
}

export function useLicence(id: string) {
  return useQuery({
    queryKey:  ['licences', id],
    queryFn:   () => licenceService.getLicenceById(id),
    enabled:   Boolean(id),
    staleTime: 1000 * 60 * 10,
  })
}

export function useMyApplications() {
  return useQuery({
    queryKey: ['licences', 'my-applications'],
    queryFn:  licenceService.getMyApplications,
  })
}

export function useApplyForLicence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ApplyPayload) => licenceService.applyForLicence(payload),
    onSuccess: () => {
      toast.success('Application submitted successfully!')
      qc.invalidateQueries({ queryKey: ['licences', 'my-applications'] })
    },
    onError: (err: { detail?: string }) => {
      toast.error(err?.detail ?? 'Failed to submit. Please try again.')
    },
  })
}