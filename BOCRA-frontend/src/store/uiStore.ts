import { create } from 'zustand'

interface UIStore {
  navOpen:              boolean
  alertBannerVisible:   boolean
  activeModal:          string | null

  toggleNav:            () => void
  closeNav:             () => void
  dismissAlertBanner:   () => void
  openModal:            (id: string) => void
  closeModal:           () => void
}

export const useUIStore = create<UIStore>((set) => ({
  navOpen:            false,
  alertBannerVisible: true,
  activeModal:        null,

  toggleNav:          () => set((s) => ({ navOpen: !s.navOpen })),
  closeNav:           () => set({ navOpen: false }),
  dismissAlertBanner: () => set({ alertBannerVisible: false }),
  openModal:          (id) => set({ activeModal: id }),
  closeModal:         () => set({ activeModal: null }),
}))
