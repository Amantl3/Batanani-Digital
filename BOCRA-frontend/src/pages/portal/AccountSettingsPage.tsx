import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { User, Mail, Globe, Save, Shield, Key } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

const schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  preferredLanguage: z.enum(['en', 'tn']),
})
type FormData = z.infer<typeof schema>

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function AccountSettingsPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      preferredLanguage: user?.preferredLanguage || 'en',
    },
  })

  // Mock update function - replace with actual API call
  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // TODO: Implement actual API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      return data
    },
    onSuccess: (data) => {
      // Update local user data
      if (user) {
        const updatedUser = { ...user, ...data }
        qc.setQueryData(['auth', 'me'], updatedUser)
        useAuthStore.getState().setUser(updatedUser)
      }
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    },
    onError: () => {
      toast.error('Failed to update profile. Please try again.')
    },
  })

  const onSubmit = (data: FormData) => {
    updateProfileMutation.mutate(data)
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  if (!user) return null

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="space-y-6"
    >
      {/* Profile Information */}
      <motion.div variants={fadeUp} className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bocra-teal">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              <p className="text-sm text-gray-600">Update your personal details</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-md border border-bocra-teal px-4 py-2 text-sm font-medium text-bocra-teal hover:bg-bocra-teal hover:text-white transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                {...register('fullName')}
                disabled={!isEditing}
                className={cn(
                  "w-full rounded-md border border-gray-300 py-3 pl-10 pr-4 focus:ring-2 focus:ring-bocra-teal focus:border-transparent transition-colors",
                  !isEditing && "bg-gray-50 cursor-not-allowed",
                  errors.fullName && "border-red-300 focus:ring-red-500"
                )}
                placeholder="Enter your full name"
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                {...register('email')}
                disabled={!isEditing}
                type="email"
                className={cn(
                  "w-full rounded-md border border-gray-300 py-3 pl-10 pr-4 focus:ring-2 focus:ring-bocra-teal focus:border-transparent transition-colors",
                  !isEditing && "bg-gray-50 cursor-not-allowed",
                  errors.email && "border-red-300 focus:ring-red-500"
                )}
                placeholder="Enter your email address"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Language
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <select
                {...register('preferredLanguage')}
                disabled={!isEditing}
                className={cn(
                  "w-full rounded-md border border-gray-300 py-3 pl-10 pr-4 focus:ring-2 focus:ring-bocra-teal focus:border-transparent transition-colors appearance-none",
                  !isEditing && "bg-gray-50 cursor-not-allowed"
                )}
              >
                <option value="en">English</option>
                <option value="tn">Setswana</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2 rounded-md bg-bocra-teal px-6 py-3 text-white hover:bg-bocra-teal/90 focus:ring-2 focus:ring-bocra-teal focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </motion.div>

      {/* Account Status */}
      <motion.div variants={fadeUp} className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
            <p className="text-sm text-gray-600">Your account verification and security details</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 py-3">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Omang Verification</span>
            </div>
            <div className="flex items-center gap-2">
              {user.omangVerified ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-green-600">Verified</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium text-yellow-600">Pending</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 py-3">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Account Role</span>
            </div>
            <span className="text-sm text-gray-600 capitalize">{user.role}</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Member Since</span>
            </div>
            <span className="text-sm text-gray-600">
              {new Date(user.createdAt).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}