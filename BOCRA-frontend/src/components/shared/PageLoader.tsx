export default function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bocra-navy">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-bocra-cyan">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-bocra-blue" />
      </div>
    </div>
  )
}
