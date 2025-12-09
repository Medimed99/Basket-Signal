import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

const PLAY_STYLES = [
  { id: 'sniper', label: 'Sniper', icon: '🎯', desc: 'Je vise la précision' },
  { id: 'dunker', label: 'Dunker', icon: '💥', desc: 'Je domine le cercle' },
  { id: 'playmaker', label: 'Playmaker', icon: '🎮', desc: 'Je crée le jeu' }
];

export default function Onboarding({ onComplete, defaultCity, onCityUpdate }) {
  const [step, setStep] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [city, setCity] = useState(defaultCity || '');

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Sauvegarder la ville si modifiée
      if (onCityUpdate && city) {
        onCityUpdate(city);
      }
      localStorage.setItem('streetsignal_onboarded', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('streetsignal_onboarded', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Progress */}
        <div className="flex justify-center space-x-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === step ? 'bg-orange-500 w-8' : i < step ? 'bg-orange-500/50 w-4' : 'bg-slate-700 w-4'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="style"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/40"
              >
                <Target size={40} className="text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Quel est ton style de jeu ?</h2>
              <p className="text-slate-400 mb-8">Choisis celui qui te correspond le mieux</p>
              
              <div className="space-y-3">
                {PLAY_STYLES.map((style) => (
                  <motion.button
                    key={style.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedStyle === style.id
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-slate-700 bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{style.icon}</span>
                      <div>
                        <div className="font-bold text-white text-lg">{style.label}</div>
                        <div className="text-sm text-slate-400">{style.desc}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="city"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/40"
              >
                <MapPin size={40} className="text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Ta ville de base ?</h2>
              <p className="text-slate-400 mb-8">On a détecté ta position, confirme ou modifie</p>
              
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Nantes, Paris, Lyon..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-white text-center text-lg font-bold focus:outline-none focus:border-orange-500"
                autoFocus
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/40"
              >
                <CheckCircle2 size={48} className="text-white" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white mb-4"
              >
                Ready to dominate?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 mb-8"
              >
                Tu es prêt à trouver des joueurs et à dominer les terrains !
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleSkip}
            className="text-slate-500 hover:text-white text-sm font-medium transition-colors"
          >
            Passer
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={step === 0 && !selectedStyle}
            className={`px-6 py-3 rounded-xl font-bold flex items-center space-x-2 ${
              step === 0 && !selectedStyle
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20'
            }`}
          >
            <span>{step === 2 ? "C'est parti !" : 'Suivant'}</span>
            {step < 2 && <ArrowRight size={18} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

