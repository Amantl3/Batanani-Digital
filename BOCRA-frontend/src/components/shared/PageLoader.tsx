import { motion } from 'framer-motion'

export default function PageLoader() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-bocra-navy">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        {/* BOCRA Logo */}
        <div className="relative mb-8">
          <img
            src="/bocra-logo-white.png"
            alt="BOCRA Logo"
            className="h-16 w-auto"
          />
          {/* Subtle pulse effect behind logo */}
          <motion.div
            className="absolute inset-0 -z-10 bg-bocra-teal/20 blur-2xl rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Loading Bar */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-bocra-teal"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        
        <p className="mt-4 text-xs font-medium uppercase tracking-widest text-white/40">
          Connecting Botswana
        </p>
      </motion.div>
    </div>
  )
}