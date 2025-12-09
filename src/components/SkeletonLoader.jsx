import { motion } from 'framer-motion';

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-900 rounded-2xl p-4 border border-slate-800"
    >
      <div className="flex items-center space-x-4">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-14 h-14 rounded-2xl bg-slate-800"
        />
        <div className="flex-1 space-y-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="h-4 bg-slate-800 rounded w-3/4"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            className="h-3 bg-slate-800 rounded w-1/2"
          />
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonRadar() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full aspect-square max-h-[360px] mx-auto bg-slate-900/50 rounded-full border border-slate-800 flex items-center justify-center"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute w-32 h-32 rounded-full border-2 border-slate-700"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        className="absolute w-24 h-24 rounded-full border-2 border-slate-700"
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-4 h-4 bg-slate-700 rounded-full"
      />
    </motion.div>
  );
}

