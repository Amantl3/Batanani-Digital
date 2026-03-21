import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import * as complaintService from '@/services/complaints'
import type { ComplaintSubmission } from '@/types'

export function useTrackComplaint(ref: string) {
  return useQuery({
    queryKey: ['complaints', 'track', ref],
    queryFn:  () => complaintService.trackComplaint(ref),
    enabled:  ref.length > 5,
    retry:    1,
  })
}

export function useMyComplaints() {
  return useQuery({
    queryKey: ['complaints', 'mine'],
    queryFn:  complaintService.getMyComplaints,
  })
}

export function useSubmitComplaint() {
  return useMutation({
    mutationFn: (payload: ComplaintSubmission) =>
      complaintService.submitComplaint(payload),
    onSuccess: ({ referenceNumber }) => {
      toast.success(`Complaint submitted! Reference: ${referenceNumber}`)
    },
    onError: (err: { detail?: string }) => {
      toast.error(err?.detail ?? 'Submission failed. Please try again.')
    },
  })
}

export function useUploadAttachment() {
  return useMutation({
    mutationFn: (file: File) => complaintService.uploadAttachment(file),
    onError: () => {
      toast.error('Upload failed. Check the file size and type.')
    },
  })
}
