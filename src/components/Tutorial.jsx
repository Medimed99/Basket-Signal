import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Target, MapPin, Users, Trophy, User, Zap, Heart, Activity, Crown, CheckCircle2 } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    id: 1,
    title: 'Bienvenue sur StreetSignal ! 🏀',
    content: 'StreetSignal te permet de trouver des joueurs de basket en temps réel près de chez toi. Commençons par découvrir les fonctionnalités principales.',
    icon: Target,
    highlight: null
  },
  {
    id: 2,
    title: 'Le Live Radar',
    content: 'Le radar affiche tous les terrains autour de toi. Les points rouges 🔥 indiquent des terrains "HOT" avec beaucoup d\'activité. Clique sur un terrain pour voir les détails.',
    icon: Target,
    highlight: 'radar'
  },
  {
    id: 3,
    title: 'Les vues disponibles',
    content: 'Tu peux basculer entre 3 vues : Radar (vue circulaire), Liste (vue détaillée) et Carte (carte interactive). Utilise les boutons en haut à droite.',
    icon: MapPin,
    highlight: 'viewMode'
  },
  {
    id: 4,
    title: 'Signaler ta présence',
    content: 'Quand tu arrives sur un terrain, appuie sur "J\'y suis !" pour créer une session. Les autres joueurs seront notifiés. Tu peux aussi dire "J\'arrive" si tu es en route.',
    icon: Zap,
    highlight: 'signal'
  },
  {
    id: 5,
    title: 'Le MVP du terrain',
    content: 'Le MVP (Most Valuable Player) est le joueur le plus actif sur un terrain. Il règne tant qu\'il reste le plus présent. Deviens MVP en jouant régulièrement !',
    icon: Crown,
    highlight: 'mvp'
  },
  {
    id: 6,
    title: 'Le Vibe Check',
    content: 'Évalue l\'ambiance du terrain en temps réel : compétition, niveau, convivialité et intensité. Cela aide les autres joueurs à choisir le bon terrain.',
    icon: Activity,
    highlight: 'vibe'
  },
  {
    id: 7,
    title: 'Le Chat de terrain',
    content: 'Communique avec les joueurs présents via le chat. Organise des matchs, demande qui a un ballon, ou simplement discute avec la communauté.',
    icon: Users,
    highlight: 'chat'
  },
  {
    id: 8,
    title: 'Le Classement',
    content: 'Consulte le leaderboard local pour voir les meilleurs joueurs de ta ville. Gagne des points ELO en gagnant des matchs et deviens le numéro 1 !',
    icon: Trophy,
    highlight: 'leaderboard'
  },
  {
    id: 9,
    title: 'Ton Profil',
    content: 'Consulte tes statistiques, ton historique de matchs, tes terrains favoris et tes badges. Gagne du Karma en signalant des problèmes sur les terrains.',
    icon: User,
    highlight: 'profile'
  },
  {
    id: 10,
    title: 'C\'est parti ! 🎯',
    content: 'Tu es maintenant prêt à utiliser StreetSignal. Trouve un terrain, signale ta présence et amuse-toi ! N\'hésite pas à explorer toutes les fonctionnalités.',
    icon: CheckCircle2,
    highlight: null
  }
];

export default function Tutorial({ isOpen, onClose, onStepHighlight }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCompleted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && onStepHighlight && TUTORIAL_STEPS[currentStep]?.highlight) {
      onStepHighlight(TUTORIAL_STEPS[currentStep].highlight);
    }
  }, [currentStep, isOpen, onStepHighlight]);

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const Icon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setCompleted(true);
      localStorage.setItem('streetsignal_tutorial_completed', 'true');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('streetsignal_tutorial_completed', 'true');
    onClose();
  };

  if (completed) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md mx-4 text-center animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Tutoriel terminé ! 🎉</h2>
          <p className="text-slate-400">Tu es maintenant prêt à utiliser StreetSignal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleSkip}></div>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl">
        {/* Progress bar */}
        <div className="h-1 bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
          ></div>
        </div>

        <div className="p-6">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <Icon size={32} className="text-orange-500" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">{step.title}</h2>

          {/* Content */}
          <p className="text-slate-300 text-center mb-6 leading-relaxed">{step.content}</p>

          {/* Step indicator */}
          <div className="flex justify-center space-x-2 mb-6">
            {TUTORIAL_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-orange-500 w-8'
                    : idx < currentStep
                    ? 'bg-orange-500/50 w-4'
                    : 'bg-slate-700 w-4'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              Passer
            </button>
            <div className="flex space-x-3">
              <button
                onClick={handlePrev}
                disabled={isFirst}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                  isFirst
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                <ArrowLeft size={18} />
                <span>Précédent</span>
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-400 hover:to-red-500 transition-all flex items-center space-x-2 shadow-lg shadow-orange-500/20"
              >
                <span>{isLast ? 'Terminer' : 'Suivant'}</span>
                {!isLast && <ArrowRight size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

