import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Users, Zap, Trophy, Navigation, User, MessageSquare, 
  Clock, Shield, AlertTriangle, ChevronRight, Filter, CheckCircle2, 
  Share2, Crown, Flame, Camera, Send, X, Settings, Target, BarChart3,
  ShoppingBag, Bell, Search, Swords, MoreVertical, Plus, Gift, CreditCard,
  Ghost, LogOut, Star, Heart, TrendingUp, TrendingDown, Activity, 
  Award, Calendar, Map, Image as ImageIcon, ThumbsUp, ThumbsDown,
  Radio, PlayCircle, PauseCircle, Eye, EyeOff, Share, HelpCircle, RotateCcw
} from 'lucide-react';
import MapView from './components/MapView';
import Tutorial from './components/Tutorial';
import Onboarding from './components/Onboarding';
import { SkeletonRadar, SkeletonCard } from './components/SkeletonLoader';
import { usePersistedState, calculateDistance, formatDistance, resetDemoData } from './utils/persistence';
import { vibrate, VibrationPatterns } from './utils/haptics';
import confetti from 'canvas-confetti';
import { supabase, isSupabaseConfigured } from './services/supabase';
import { reverseGeocode } from './services/geocoding';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

// --- DONNÉES DE DÉMONSTRATION (MOCK DATA) ---

const DEFAULT_USER = {
  id: 'u1',
  name: 'Dydy P.',
  handle: '@dydy_player',
  rank: 'Street Legend',
  level: 42,
  points: 1250, // ELO
  karma: 450,   // Monnaie Shop (B2B/B2G reward)
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dydy&backgroundColor=b6e3f4',
  city: 'Paris', // Par défaut Paris au lieu de Nantes
  badges: ['Early Adopter', 'Sniper', 'Night Owl']
};

const SPONSORED_CHALLENGE = {
  id: 'c1',
  brand: 'Decathlon',
  title: 'Défi Tarmak 3x3',
  desc: 'Joue sur 3 terrains différents cette semaine.',
  progress: 1,
  total: 3,
  reward: '-20% sur la gamme Tarmak'
};

const LEADERBOARD = [
  { id: 1, name: 'Dydy P.', points: 1250, avatar: DEFAULT_USER.avatar, rank: 1, trend: 'up' },
  { id: 2, name: 'Sarah B.', points: 1180, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', rank: 2, trend: 'same' },
  { id: 3, name: 'Moussa D.', points: 950, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moussa', rank: 3, trend: 'down' },
  { id: 4, name: 'Thomas R.', points: 820, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas', rank: 4, trend: 'up' },
  { id: 5, name: 'Léa P.', points: 790, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lea', rank: 5, trend: 'up' },
];

const SHOP_OFFERS = [
  { id: 1, brand: 'Decathlon', title: '-20% Rayon Basket', cost: 200, image: 'shopping', desc: 'Valable sur la marque Tarmak.' },
  { id: 2, brand: 'Nike Store', title: '15€ offerts', cost: 500, image: 'gift', desc: 'Dès 80€ d\'achat au magasin Atlantis.' },
  { id: 3, brand: 'Ville de Nantes', title: 'Place match Hermine', cost: 800, image: 'ticket', desc: '1 place pour le prochain match pro.' },
];

const MESSAGES = [
  { id: 1, user: 'Sarah B.', text: 'On est 3 au playground des Machines, il en manque 1 !', time: '14:02', isMe: false },
  { id: 2, user: 'Moussa D.', text: 'J\'arrive dans 10 min avec le ballon.', time: '14:05', isMe: false },
  { id: 3, user: 'Dydy P.', text: 'Chaud, je pars de chez moi.', time: '14:06', isMe: true },
];

const COURTS_DATA = [
  {
    id: 1,
    name: 'Playground des Machines',
    distance: '0.4 km',
    status: 'hot', 
    players: 8,
    maxPlayers: 15,
    vibe: 'Compétition', 
    vibeScore: 4.8,
    vibeHistory: [4.5, 4.7, 4.8, 4.6, 4.8],
    floor: 'Gomme',
    lighting: true,
    water: true,
    mvp: { name: 'Sarah B.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', daysReigning: 12 },
    issues: [],
    coordinates: { x: 50, y: 40 },
    lat: 47.2186, lng: -1.5547,
    lastSignal: 'Il y a 2 min',
    chatCount: 12,
    activeSession: {
      id: 's1',
      startTime: '14:00',
      players: [
        { id: 'p1', name: 'Sarah B.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', status: 'playing' },
        { id: 'p2', name: 'Moussa D.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moussa', status: 'playing' },
        { id: 'p3', name: 'Thomas R.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas', status: 'waiting' },
      ],
      vibeRatings: { competition: 8, skill: 9, friendly: 7, intensity: 9 }
    },
    photos: [
      'https://images.unsplash.com/photo-1519766304817-4f37bda374a4?w=400',
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400'
    ],
    favorite: false,
    visits: 15,
    lastVisit: 'Il y a 3 jours'
  },
  {
    id: 2,
    name: 'City Stade Malakoff',
    distance: '1.2 km',
    status: 'active',
    players: 3,
    maxPlayers: 10,
    vibe: 'Pickup',
    vibeScore: 4.2,
    vibeHistory: [4.0, 4.1, 4.2, 4.3, 4.2],
    floor: 'Bitume',
    lighting: true,
    water: false,
    mvp: { name: 'Thomas R.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas', daysReigning: 5 },
    issues: ['Filet manquant'],
    coordinates: { x: 20, y: 70 },
    lat: 47.2150, lng: -1.5500,
    lastSignal: 'Il y a 15 min',
    chatCount: 3,
    activeSession: {
      id: 's2',
      startTime: '13:45',
      players: [
        { id: 'p4', name: 'Thomas R.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas', status: 'playing' },
        { id: 'p5', name: 'Léa P.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lea', status: 'playing' },
      ],
      vibeRatings: { competition: 6, skill: 7, friendly: 8, intensity: 6 }
    },
    photos: ['https://images.unsplash.com/photo-1519766304817-4f37bda374a4?w=400'],
    favorite: true,
    visits: 8,
    lastVisit: 'Hier'
  },
  {
    id: 3,
    name: 'Terrain Vieux Doulon',
    distance: '2.5 km',
    status: 'empty',
    players: 0,
    maxPlayers: 10,
    vibe: 'Chill',
    vibeScore: 3.5,
    vibeHistory: [3.2, 3.4, 3.5, 3.6, 3.5],
    floor: 'Béton',
    lighting: false,
    water: true,
    mvp: { name: 'Mehdi K.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehdi', daysReigning: 28 },
    issues: [],
    coordinates: { x: 80, y: 20 },
    lat: 47.2250, lng: -1.5600,
    lastSignal: 'Hier',
    chatCount: 0,
    activeSession: null,
    photos: [],
    favorite: false,
    visits: 2,
    lastVisit: 'Il y a 2 semaines'
  },
];

const NOTIFICATIONS = [
  { id: 1, type: 'game', title: 'Validation requise', text: 'Sarah B. déclare une victoire 21-18 contre vous.', time: '2 min', action: true, read: false },
  { id: 2, type: 'alert', title: 'Terrain Hot 🔥', text: 'Gros niveau au Playground des Machines actuellement.', time: '15 min', action: false, read: false },
  { id: 3, type: 'signal', title: 'Nouveau signal', text: '3 joueurs arrivent au City Stade Malakoff dans 10 min.', time: '1h', action: false, read: true },
  { id: 4, type: 'vibe', title: 'Vibe Check mis à jour', text: 'Le Playground des Machines a un nouveau score de 4.8/5.', time: '2h', action: false, read: true },
];

// --- COMPOSANTS UI UTILITAIRES ---

const Badge = ({ children, type, className, icon: Icon }) => {
  const styles = {
    hot: 'bg-red-500/20 text-red-400 border-red-500/50',
    active: 'bg-green-500/20 text-green-400 border-green-500/50',
    empty: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
    vibe: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    karma: 'bg-purple-500/20 text-purple-300 border-purple-500/50'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border flex items-center w-fit ${styles[type] || styles.info} ${className}`}>
      {Icon && <Icon size={10} className="mr-1" />}
      {children}
    </span>
  );
};

const Modal = ({ isOpen, onClose, children, title, fullScreen = false }) => {
  if (!isOpen) return null;
  const baseClasses = "fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200";
  const contentClasses = fullScreen 
    ? "bg-slate-900 w-full h-full relative flex flex-col animate-in slide-in-from-bottom-5 duration-300"
    : "bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200 shadow-2xl shadow-orange-500/5 flex flex-col max-h-[85vh]";

  return (
    <div className={baseClasses}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className={contentClasses}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
          <h3 className="font-bold text-lg text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-4 custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- APP PRINCIPALE ---

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('radar');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [viewMode, setViewMode] = useState('radar');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ light: false, water: false });
  
  // États persistants
  // On initialise à vide. Les données viendront du réseau (ou du cache localStorage).
  const [courtsData, setCourtsData] = usePersistedState('streetsignal_courts', []);
  const [userKarma, setUserKarma] = usePersistedState('streetsignal_user_karma', DEFAULT_USER.karma);
  const [mySignal, setMySignal] = usePersistedState('streetsignal_signals', null);
  const [favorites, setFavorites] = usePersistedState('streetsignal_favorites', []);
  
  // Modals & Flows States
  const [signaling, setSignaling] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [notification, setNotification] = useState(null);
  const [showVibeCheck, setShowVibeCheck] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 47.2186, lng: -1.5547 });
  const [showTutorial, setShowTutorial] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [reportPhoto, setReportPhoto] = useState(null);
  const [ticketNumber, setTicketNumber] = useState(null);
  const [currentUser, setCurrentUser] = usePersistedState('streetsignal_user', DEFAULT_USER);
  const [eloHistory, setEloHistory] = useState([]);
  const [fetchingCourts, setFetchingCourts] = useState(false);
  const [eloDelta, setEloDelta] = useState(0);

  const chatEndRef = useRef(null);

  // Fetch de l'historique ELO depuis Supabase
  useEffect(() => {
    const fetchEloHistory = async () => {
      // Toujours initialiser avec des données mock
      const mockHistory = [
        { elo: 1180, date: '1 jan' },
        { elo: 1195, date: '5 jan' },
        { elo: 1200, date: '10 jan' },
        { elo: 1210, date: '15 jan' },
        { elo: 1220, date: '20 jan' },
        { elo: 1230, date: '25 jan' },
        { elo: 1225, date: '28 jan' },
        { elo: 1240, date: '1 fév' },
        { elo: 1235, date: '5 fév' },
        { elo: 1245, date: '10 fév' },
        { elo: 1250, date: '15 fév' }
      ];
      setEloHistory(mockHistory);
      if (mockHistory.length > 0) {
        setEloDelta(currentUser.points - mockHistory[0].elo);
      }

      // Essayer de fetch depuis Supabase si configuré
      if (isSupabaseConfigured() && supabase && currentUser.id) {
        try {
          const { data, error } = await supabase
            .from('elo_history')
            .select('new_elo, created_at')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: true })
            .limit(30);

          if (!error && data && data.length > 0) {
            const formatted = data.map(item => ({
              elo: item.new_elo,
              date: new Date(item.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
            }));
            setEloHistory(formatted);
            
            // Calculer le delta (dernier - premier)
            const firstElo = formatted[0].elo;
            const lastElo = formatted[formatted.length - 1].elo;
            setEloDelta(lastElo - firstElo);
          }
        } catch (error) {
          console.error('Error in fetchEloHistory:', error);
          // En cas d'erreur, garder les données mock
        }
      }
    };

    fetchEloHistory();
  }, [currentUser.id]);

  // Simulation Onboarding + Vérification tutoriel
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      // Vérifier si l'onboarding a été complété
      const onboarded = localStorage.getItem('streetsignal_onboarded');
      if (!onboarded) {
        setShowOnboarding(true);
      } else {
        // Vérifier si le tutoriel a déjà été complété
        const tutorialCompleted = localStorage.getItem('streetsignal_tutorial_completed');
        if (!tutorialCompleted) {
          setTimeout(() => setShowTutorial(true), 500);
        }
      }
    }, 2000);
  }, []);

  // Géolocalisation intelligente avec reverse geocoding
  useEffect(() => {
    let isMounted = true;
    
    const detectLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            if (isMounted) {
              const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setUserLocation(newLocation);
              
              // Reverse geocoding pour détecter la ville
              const geoData = await reverseGeocode(newLocation.lat, newLocation.lng);
              if (geoData.city && isMounted) {
                setCurrentUser(prev => ({ ...prev, city: geoData.city }));
              }
            }
          },
          () => {
            // En cas d'erreur, utiliser position par défaut (Paris) en mode démo
            if (isMounted) {
              setUserLocation({ lat: 48.8566, lng: 2.3522 }); // Paris au lieu de Nantes
              setDemoMode(true);
              setCurrentUser(prev => ({ ...prev, city: 'Paris' }));
              triggerNotif("Mode Démo", "Position simulée à Paris pour la démonstration.", 'info');
            }
          }
        );
      } else {
        // Pas de géolocalisation disponible, mode démo avec Paris
        if (isMounted) {
          setUserLocation({ lat: 48.8566, lng: 2.3522 });
          setDemoMode(true);
          setCurrentUser(prev => ({ ...prev, city: 'Paris' }));
          triggerNotif("Mode Démo", "Position simulée à Paris pour la démonstration.", 'info');
        }
      }
    };

    detectLocation();
    return () => { isMounted = false; };
  }, []);

  // Fetch des terrains depuis Supabase
  useEffect(() => {
    if (!userLocation) return;

    // 1. Vérification de la connexion Supabase
    if (!isSupabaseConfigured() || !supabase) {
      console.warn("Supabase non configuré ou hors ligne. Chargement mode Démo.");
      // C'est ICI qu'on injecte les mocks si (et seulement si) la connexion échoue
      if (courtsData.length === 0) {
        setCourtsData(COURTS_DATA);
      }
      return;
    }

    const fetchCourts = async () => {
      setFetchingCourts(true);
      try {
        // Bounding box approximative (20km autour de la position)
        const radius = 0.2; // ~20km en degrés
        const minLat = userLocation.lat - radius;
        const maxLat = userLocation.lat + radius;
        const minLng = userLocation.lng - radius;
        const maxLng = userLocation.lng + radius;

        const { data, error } = await supabase
          .from('courts')
          .select('*')
          .gte('lat', minLat)
          .lte('lat', maxLat)
          .gte('lng', minLng)
          .lte('lng', maxLng)
          .limit(100); // Limiter à 100 terrains pour la performance

        if (error) {
          console.error('Erreur fetch:', error);
          // En cas d'erreur critique réseau, on peut remettre les mocks en secours
          if (courtsData.length === 0) {
            setCourtsData(COURTS_DATA);
          }
          setFetchingCourts(false);
          return;
        }

        // AJOUTER ICI : Gestion du cas "0 terrain trouvé"
        if (data && data.length === 0) {
          // Si la base est accessible mais vide autour du user, on ne charge PAS les mocks.
          // On laisse la liste vide (ou on affiche un message UI "Pas de terrain ici").
          setCourtsData([]);
          setFetchingCourts(false);
          return;
        }

        if (data && data.length > 0) {
          // Mapper les données Supabase vers le format attendu
          const formattedCourts = data.map(court => {
            const distanceKm = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              court.lat,
              court.lng
            );
            
            return {
              id: court.id,
              name: court.name,
              distance: formatDistance(distanceKm),
              distanceKm,
              status: 'empty', // Par défaut, à mettre à jour avec des données réelles
              players: 0,
              maxPlayers: court.max_players || 10,
              vibe: 'Pickup',
              vibeScore: null,
              vibeHistory: [],
              floor: court.floor || 'Bitume',
              lighting: court.lighting || false,
              water: court.water || false,
              mvp: null, // À calculer depuis les données réelles
              issues: [],
              coordinates: { x: 50, y: 40 }, // Pour le radar, à calculer dynamiquement
              lat: court.lat,
              lng: court.lng,
              lastSignal: null,
              chatCount: 0,
              activeSession: null,
              photos: [],
              favorite: favorites.includes(court.id),
              visits: 0,
              lastVisit: null
            };
          }).sort((a, b) => a.distanceKm - b.distanceKm);

          setCourtsData(formattedCourts);
        }
      } catch (error) {
        console.error('Erreur fetch:', error);
        // En cas d'erreur critique réseau, on peut remettre les mocks en secours
        if (courtsData.length === 0) {
          setCourtsData(COURTS_DATA);
        }
      } finally {
        setFetchingCourts(false);
      }
    };

    fetchCourts();
  }, [userLocation]); // Retirer 'favorites' des dépendances pour éviter les boucles

  // Recalculer les distances quand la position change (pour données mock)
  useEffect(() => {
    if (userLocation && courtsData.length > 0 && !isSupabaseConfigured()) {
      const updatedCourts = courtsData.map(court => {
        const distanceKm = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          court.lat,
          court.lng
        );
        return {
          ...court,
          distance: formatDistance(distanceKm),
          distanceKm
        };
      }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
      
      setCourtsData(updatedCourts);
    }
  }, [userLocation]);

  // Toast Timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- HANDLERS ---

  const triggerNotif = (title, message, type = 'info') => {
    setNotification({ title, message, type });
  };

  const handleSignal = (type) => {
    if (!selectedCourt) return;
    
    setSignaling(true);
    vibrate(VibrationPatterns.checkIn);
    
    // Simuler l'appel réseau avec délai
    setTimeout(() => {
      setMySignal(type);
      setSignaling(false);
      
      // Mettre à jour le terrain pour le rendre "Hot" si check-in
      if (type === 'here') {
        const updatedCourts = courtsData.map(court => {
          if (court.id === selectedCourt.id) {
            return {
              ...court,
              status: 'hot',
              players: Math.min(court.players + 1, court.maxPlayers),
              lastSignal: 'À l\'instant'
            };
          }
          return court;
        });
        setCourtsData(updatedCourts);
        setSelectedCourt(updatedCourts.find(c => c.id === selectedCourt.id));
      }
      
      vibrate(VibrationPatterns.success);
      triggerNotif(
        type === 'here' ? "Check-in Validé ! 📍" : "Signal Envoyé 🏃‍♂️", 
        type === 'here' ? "Vous êtes MVP provisoire. Défendez votre titre !" : "Les joueurs sur place ont été notifiés.", 
        'success'
      );
    }, 1500);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Afficher le tutoriel après l'onboarding
    setTimeout(() => {
      const tutorialCompleted = localStorage.getItem('streetsignal_tutorial_completed');
      if (!tutorialCompleted) {
        setShowTutorial(true);
      }
    }, 500);
  };

  const handleReport = async (issueType) => {
    // Simuler la prise de photo
    setReportPhoto(`https://images.unsplash.com/photo-1519766304817-4f37bda374a4?w=400&seed=${issueType}`);
    
    // Générer un numéro de ticket
    const ticket = Math.floor(Math.random() * 9000) + 1000;
    setTicketNumber(ticket);
    
    setTimeout(() => {
      setShowReportModal(false);
      setUserKarma(prev => prev + 50);
      vibrate(VibrationPatterns.success);
      triggerNotif(
        "Ticket Mairie créé ! 🏛️", 
        `Ticket #${ticket} ouvert par les Services Techniques de ${currentUser.city}. Merci ! +50 Karma`, 
        'karma'
      );
      setReportPhoto(null);
      setTicketNumber(null);
    }, 2000);
  };

  const handleGameSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const myScore = parseInt(formData.get('myScore') || '21');
    const opponentScore = parseInt(formData.get('opponentScore') || '18');
    const isVictory = myScore > opponentScore;
    
    setShowGameModal(false);
    
    if (isVictory) {
      // Screen shake + Confettis pour la victoire
      document.body.style.animation = 'shake 0.5s';
      setTimeout(() => {
        document.body.style.animation = '';
      }, 500);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      vibrate(VibrationPatterns.victory);
      triggerNotif("Victoire ! 🏆", `Tu as gagné ${myScore}-${opponentScore} ! +12 points ELO`, 'success');
    } else {
      vibrate(VibrationPatterns.error);
      triggerNotif("Match déclaré 🏀", "En attente de validation par l'adversaire (Anti-Cheat actif).", 'info');
    }
  };

  const handleRedeem = (cost) => {
    if(userKarma >= cost) {
      setUserKarma(prev => prev - cost);
      triggerNotif("Récompense débloquée ! 🎁", "Retrouvez votre code QR dans votre profil.", 'success');
    } else {
      triggerNotif("Karma insuffisant", "Signalez plus de problèmes ou jouez plus de matchs !", 'error');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if(!chatMessage.trim()) return;
    setChatMessage('');
    triggerNotif("Message envoyé", "Votre message est visible par le crew.", 'info');
  };

  const filteredCourts = courtsData.filter(c => {
    if (filters.light && !c.lighting) return false;
    if (filters.water && !c.water) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleFavorite = (courtId) => {
    const updatedCourts = courtsData.map(court => {
      if (court.id === courtId) {
        const newFavorite = !court.favorite;
        if (newFavorite && !favorites.includes(courtId)) {
          setFavorites([...favorites, courtId]);
        } else if (!newFavorite) {
          setFavorites(favorites.filter(id => id !== courtId));
        }
        return { ...court, favorite: newFavorite };
      }
      return court;
    });
    setCourtsData(updatedCourts);
    vibrate(50);
    triggerNotif(
      updatedCourts.find(c => c.id === courtId)?.favorite 
        ? "Terrain ajouté aux favoris ❤️" 
        : "Terrain retiré des favoris", 
      "", 
      'info'
    );
  };

  const handleVibeCheck = (courtId, ratings) => {
    const updatedCourts = courtsData.map(court => {
      if (court.id === courtId && court.vibeHistory) {
        const newScore = (ratings.competition + ratings.skill + ratings.friendly + ratings.intensity) / 4;
        const updatedHistory = [...court.vibeHistory, newScore];
        if (updatedHistory.length > 5) updatedHistory.shift();
        const newVibeScore = (updatedHistory.reduce((a, b) => a + b, 0) / updatedHistory.length).toFixed(1);
        return {
          ...court,
          vibeHistory: updatedHistory,
          vibeScore: parseFloat(newVibeScore)
        };
      }
      return court;
    });
    setCourtsData(updatedCourts);
    if (selectedCourt && selectedCourt.id === courtId) {
      setSelectedCourt(updatedCourts.find(c => c.id === courtId));
    }
    setShowVibeCheck(false);
    vibrate(VibrationPatterns.success);
    triggerNotif("Vibe Check enregistré! 🎯", "Merci d'avoir contribué à la communauté.", 'success');
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-slate-950 items-center justify-center relative overflow-hidden p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/40 via-slate-950 to-slate-950"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="z-10 flex flex-col items-center w-full max-w-md"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/40 mb-6"
          >
            <Zap size={48} className="text-white fill-current" />
          </motion.div>
          <h1 className="font-bold text-4xl text-white tracking-tighter mb-2">StreetSignal<span className="text-orange-500">.</span></h1>
          <p className="text-slate-500 text-sm font-mono uppercase tracking-widest mb-8">Connect. Play. Dominate.</p>
          <div className="w-full space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 bg-slate-900/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
        <div className="flex items-center space-x-3" onClick={() => setActiveTab('radar')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 cursor-pointer">
            <Zap size={20} className="text-white fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight">StreetSignal<span className="text-orange-500">.</span></h1>
            <div className="flex items-center text-[10px] text-slate-400 mt-0.5 font-medium uppercase tracking-wider">
              <MapPin size={10} className="mr-1 text-orange-500" /> {currentUser.city}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Settings Button */}
          <button 
            className="p-2 text-slate-400 hover:text-white transition-colors active:scale-95" 
            onClick={() => setShowSettings(true)}
            title="Paramètres"
          >
            <Settings size={22} />
          </button>
          {/* Tutorial Button */}
          <button 
            className="p-2 text-slate-400 hover:text-white transition-colors active:scale-95" 
            onClick={() => setShowTutorial(true)}
            title="Tutoriel"
          >
            <HelpCircle size={22} />
          </button>
          {/* Shop Button */}
          <div className="flex items-center bg-slate-800 rounded-full px-2 py-1 border border-slate-700 cursor-pointer active:scale-95 transition-transform" onClick={() => setShowShop(true)}>
             <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center mr-1.5 shadow-sm shadow-purple-500/50">
               <Shield size={8} className="text-white fill-current"/>
             </div>
             <span className="text-xs font-bold text-purple-200">{userKarma}</span>
          </div>
          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors active:scale-95" onClick={() => setShowNotifs(true)}>
             <Bell size={22} />
             {NOTIFICATIONS.filter(n => !n.read).length > 0 && <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900 animate-pulse"></span>}
          </button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        
        {/* --- ONGLET RADAR / HOME --- */}
        <AnimatePresence mode="wait">
          {activeTab === 'radar' && (
            <motion.div
              key="radar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
          <div className="p-4 space-y-5 animate-in fade-in duration-300">
            
            {/* Sponsored Challenge */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-0.5 border border-slate-700 shadow-lg relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all">
              <div className="bg-slate-900/90 p-3 rounded-[10px] h-full relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-orange-500 mb-1 flex items-center">
                    <Target size={10} className="mr-1" /> Challenge Sponsorisé
                  </div>
                  <h3 className="font-bold text-white text-sm">{SPONSORED_CHALLENGE.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{SPONSORED_CHALLENGE.desc}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{SPONSORED_CHALLENGE.progress}/{SPONSORED_CHALLENGE.total}</div>
                  <div className="w-16 h-1.5 bg-slate-700 rounded-full mt-1">
                    <div className="h-full bg-orange-500 rounded-full" style={{width: '33%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Live Radar</h2>
                <p className="text-xs text-slate-400 flex items-center">
                   {filteredCourts.length} spots actifs • <span className="text-green-500 ml-1">128 joueurs</span>
                </p>
              </div>
              <div className="flex space-x-2">
                 <button onClick={() => setShowSearch(true)} className="p-2 rounded-xl border bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 transition-all">
                    <Search size={18} />
                 </button>
                 <button onClick={() => setFiltersOpen(!filtersOpen)} className={`p-2 rounded-xl border transition-all ${filtersOpen ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                    <Filter size={18} />
                 </button>
                 {/* Sélecteur de modes de visionnage amélioré */}
                 <div className="flex bg-slate-800 rounded-xl p-1.5 border border-slate-700 gap-1">
                    <button 
                      onClick={() => setViewMode('radar')} 
                      className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        viewMode === 'radar' 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                      }`}
                      title="Vue Radar"
                    >
                      <Target size={18} className={viewMode === 'radar' ? 'fill-current' : ''} />
                      <span className="text-xs font-medium hidden sm:inline">Radar</span>
                    </button>
                    <button 
                      onClick={() => setViewMode('list')} 
                      className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        viewMode === 'list' 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                      }`}
                      title="Vue Liste"
                    >
                      <MoreVertical size={18} />
                      <span className="text-xs font-medium hidden sm:inline">Liste</span>
                    </button>
                    <button 
                      onClick={() => { setViewMode('map'); setShowMap(true); }} 
                      className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        viewMode === 'map' 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                      }`}
                      title="Vue Carte"
                    >
                      <Map size={18} className={viewMode === 'map' ? 'fill-current' : ''} />
                      <span className="text-xs font-medium hidden sm:inline">Carte</span>
                    </button>
                 </div>
              </div>
            </div>

            {/* Filters */}
            {filtersOpen && (
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex gap-2 animate-in slide-in-from-top-2">
                 <button onClick={() => setFilters({...filters, light: !filters.light})} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filters.light ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>💡 Éclairé</button>
                 <button onClick={() => setFilters({...filters, water: !filters.water})} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filters.water ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>💧 Point d'eau</button>
              </div>
            )}
            
            {/* Empty State */}
            {filteredCourts.length === 0 && (
              <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8 text-center mb-6">
                <MapPin size={48} className="text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Aucun terrain trouvé</h3>
                <p className="text-slate-400 text-sm mb-4">
                  {demoMode 
                    ? "Aucun terrain de démo dans cette zone."
                    : "Aucun terrain ne correspond à tes critères."}
                </p>
                {demoMode && (
                  <button
                    onClick={() => {
                      // Générer des terrains de démo autour de la position
                      const demoCourts = COURTS_DATA.map((court, idx) => ({
                        ...court,
                        lat: userLocation.lat + (Math.random() - 0.5) * 0.1,
                        lng: userLocation.lng + (Math.random() - 0.5) * 0.1,
                        distance: formatDistance(calculateDistance(userLocation.lat, userLocation.lng, court.lat, court.lng)),
                        distanceKm: calculateDistance(userLocation.lat, userLocation.lng, court.lat, court.lng)
                      })).sort((a, b) => a.distanceKm - b.distanceKm);
                      setCourtsData(demoCourts);
                      triggerNotif("Terrains de démo générés", "Des terrains ont été créés autour de ta position.", 'success');
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-500 transition-colors"
                  >
                    Générer des terrains de démo autour de moi
                  </button>
                )}
              </div>
            )}

            {/* MAIN CONTENT: RADAR, LIST or MAP */}
            {filteredCourts.length > 0 && viewMode === 'map' ? (
              <div className="relative w-full aspect-square max-h-[360px] mx-auto bg-slate-900/50 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden mb-6">
                <MapView 
                  courts={filteredCourts}
                  userLocation={[userLocation.lat, userLocation.lng]}
                  onCourtClick={(court) => setSelectedCourt(court)}
                />
              </div>
            ) : viewMode === 'radar' ? (
              <div className="relative w-full aspect-square max-h-[360px] mx-auto bg-slate-900/50 rounded-full border border-slate-800 shadow-2xl shadow-indigo-500/5 overflow-hidden flex items-center justify-center mb-6">
                <div className="absolute inset-0 border border-slate-800/50 rounded-full m-12"></div>
                <div className="absolute inset-0 border border-slate-800/50 rounded-full m-24"></div>
                <div className="absolute inset-0 border border-slate-800/50 rounded-full m-36"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent w-full h-full animate-[spin_4s_linear_infinite] rounded-full opacity-40 pointer-events-none"></div>
                <div className="absolute z-10 w-4 h-4 bg-blue-500 rounded-full border-4 border-slate-900 shadow-lg shadow-blue-500/50 animate-pulse"></div>
                {filteredCourts.map((court) => (
                  <button key={court.id} onClick={() => setSelectedCourt(court)} className={`absolute group z-20 transition-all duration-300 hover:scale-125 hover:z-30`} style={{ left: `${court.coordinates.x}%`, top: `${court.coordinates.y}%` }}>
                    <div className={`w-9 h-9 -ml-4.5 -mt-4.5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg ${court.status === 'hot' ? 'bg-red-500 animate-pulse shadow-red-500/40' : court.status === 'active' ? 'bg-green-500 shadow-green-500/40' : 'bg-slate-600'}`}>
                      {court.status === 'hot' ? <Flame size={16} className="text-white fill-white" /> : <MapPin size={16} className="text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                 {filteredCourts.map((court) => (
                  <div key={court.id} onClick={() => setSelectedCourt(court)} className="bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all rounded-2xl p-4 border border-slate-800 flex items-center justify-between cursor-pointer group shadow-sm">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${court.status === 'hot' ? 'bg-red-500/10 text-red-500' : court.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-slate-700/30 text-slate-500'}`}>
                         {court.status === 'hot' ? <Flame className="fill-current animate-pulse" size={24} /> : <MapPin size={24} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                           <h3 className="font-bold text-slate-100 group-hover:text-orange-400 transition-colors">{court.name}</h3>
                           {court.status === 'hot' && <Badge type="hot" icon={Flame}>HOT</Badge>}
                           {court.favorite && <Heart size={14} className="text-red-500 fill-current" />}
                        </div>
                        <div className="flex items-center text-xs text-slate-400 mt-1.5 space-x-3">
                          <span className="flex items-center"><Navigation size={10} className="mr-1"/> {court.distance}</span>
                          <span className="flex items-center"><Users size={10} className="mr-1"/> {court.players}/{court.maxPlayers}</span>
                          {court.vibeScore && <span className="flex items-center"><Star size={10} className="mr-1 text-yellow-500 fill-current"/> {court.vibeScore}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(court.id); }} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <Heart size={18} className={court.favorite ? "text-red-500 fill-current" : "text-slate-600"} />
                      </button>
                      <ChevronRight size={20} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 space-y-6 animate-in slide-in-from-right-10 duration-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Street Rank</h2>
              <p className="text-slate-400 text-xs">Saison Hiver • {currentUser.city}</p>
              <div className="flex items-center justify-center space-x-4 mt-3">
                <button className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold border border-slate-700">Local</button>
                <button className="px-3 py-1 bg-slate-800/50 text-slate-500 rounded-lg text-xs font-bold border border-slate-800">National</button>
              </div>
            </div>
            {/* Podium */}
            <div className="flex justify-center items-end space-x-4 mb-8">
               <div className="flex flex-col items-center">
                 <div className="w-16 h-16 rounded-full border-2 border-slate-600 p-0.5 relative"><img src={LEADERBOARD[1].avatar} alt={LEADERBOARD[1].name} className="w-full h-full rounded-full bg-slate-800" /><div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-700 text-white text-xs px-2 rounded-full font-bold">2</div></div>
                 <span className="text-xs font-bold mt-2 text-slate-300">{LEADERBOARD[1].name}</span>
                 <span className="text-xs text-slate-500 mt-1">{LEADERBOARD[1].points} pts</span>
                 {LEADERBOARD[1].trend === 'up' && <TrendingUp size={12} className="text-green-500 mt-1" />}
               </div>
               <div className="flex flex-col items-center">
                 <Crown className="text-yellow-500 mb-2 fill-yellow-500/20" size={24} />
                 <div className="w-20 h-20 rounded-full border-2 border-yellow-500 p-0.5 relative shadow-[0_0_15px_rgba(234,179,8,0.3)]"><img src={LEADERBOARD[0].avatar} alt={LEADERBOARD[0].name} className="w-full h-full rounded-full bg-slate-800" /><div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">1</div></div>
                 <span className="text-sm font-bold mt-2 text-white">{LEADERBOARD[0].name}</span>
                 <span className="text-xs text-yellow-400 mt-1">{LEADERBOARD[0].points} pts</span>
               </div>
               <div className="flex flex-col items-center">
                 <div className="w-16 h-16 rounded-full border-2 border-orange-700 p-0.5 relative"><img src={LEADERBOARD[2].avatar} alt={LEADERBOARD[2].name} className="w-full h-full rounded-full bg-slate-800" /><div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-800 text-white text-xs px-2 rounded-full font-bold">3</div></div>
                 <span className="text-xs font-bold mt-2 text-slate-300">{LEADERBOARD[2].name}</span>
                 <span className="text-xs text-slate-500 mt-1">{LEADERBOARD[2].points} pts</span>
                 {LEADERBOARD[2].trend === 'down' && <TrendingDown size={12} className="text-red-500 mt-1" />}
               </div>
            </div>
            {/* List */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-3 bg-slate-800/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between border-b border-slate-800"><span>Joueur</span><span>Points</span></div>
              {LEADERBOARD.map((user) => (
                <div key={user.id} className={`p-4 flex items-center justify-between border-b border-slate-800/50 ${user.name === currentUser.name ? 'bg-orange-500/5 border-orange-500/20' : ''}`}>
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-slate-500 font-mono w-6 text-sm">{user.rank}</span>
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700" />
                    <div className="flex-1">
                      <div className={`font-bold text-sm flex items-center space-x-2 ${user.name === currentUser.name ? 'text-orange-500' : 'text-slate-200'}`}>
                        <span>{user.name}</span>
                        {user.name === currentUser.name && <Badge type="info" className="text-[9px]">Vous</Badge>}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {user.trend === 'up' && <TrendingUp size={10} className="text-green-500" />}
                        {user.trend === 'down' && <TrendingDown size={10} className="text-red-500" />}
                        <span className="text-xs text-slate-500">Niveau {Math.floor(user.points / 30)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{user.points}</div>
                    <div className="text-[10px] text-slate-500">ELO</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Stats globales */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
              <h3 className="font-bold text-sm text-slate-400 mb-3 uppercase tracking-wide">Statistiques globales</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">156</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">Joueurs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-500">42</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">Terrains</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-500">1.2k</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">Matchs</div>
                </div>
                 </div>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 space-y-4 animate-in slide-in-from-right-10 duration-200">
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col items-center relative overflow-hidden">
                 <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-orange-500/20 to-transparent"></div>
                 <div className="w-24 h-24 rounded-full border-4 border-slate-950 shadow-2xl z-10 bg-slate-800"><img src={currentUser.avatar} alt="Profile" className="w-full h-full rounded-full" /></div>
                 <h2 className="text-2xl font-bold mt-3 text-white">{currentUser.name}</h2>
                 <p className="text-orange-500 font-medium text-sm">{currentUser.rank}</p>
                 <p className="text-slate-400 text-xs mt-1">Niveau {currentUser.level}</p>
                 <div className="grid grid-cols-3 gap-8 mt-6 w-full text-center border-t border-slate-800 pt-6">
                    <div><div className="text-2xl font-black text-white">{currentUser.points}</div><div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">ELO</div><div className="flex items-center justify-center mt-1">{eloDelta >= 0 ? <TrendingUp size={12} className="text-green-500" /> : <TrendingDown size={12} className="text-red-500" />}<span className={`text-[10px] ml-1 ${eloDelta >= 0 ? 'text-green-500' : 'text-red-500'}`}>{eloDelta >= 0 ? '+' : ''}{eloDelta || 45}</span></div></div>
                    <div><div className="text-2xl font-black text-purple-400">{userKarma}</div><div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">KARMA</div></div>
                    <div><div className="text-2xl font-black text-white">42</div><div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">MATCHS</div><div className="text-[10px] text-slate-500 mt-1">28W-14L</div></div>
                 </div>
              </div>

              {/* Badges */}
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                 <h3 className="font-bold text-sm text-slate-400 mb-3 uppercase tracking-wide flex items-center">
                   <Award size={14} className="mr-2 text-orange-500" /> Badges
                 </h3>
                 <div className="flex flex-wrap gap-2">
                   {currentUser.badges.map((badge, idx) => (
                     <Badge key={idx} type="info" className="text-xs">{badge}</Badge>
                   ))}
                 </div>
              </div>

              {/* Statistiques détaillées */}
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                 <h3 className="font-bold text-sm text-slate-400 mb-3 uppercase tracking-wide flex items-center">
                   <BarChart3 size={14} className="mr-2 text-orange-500" /> Statistiques
                 </h3>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-slate-300">Taux de victoire</span>
                     <span className="text-sm font-bold text-white">66.7%</span>
                   </div>
                   <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{width: '66.7%'}}></div>
                   </div>
                   
                   {/* Graphique ELO avec Recharts */}
                   {eloHistory.length > 0 && (
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 mt-4">
                       <div className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Évolution ELO (30 derniers jours)</div>
                       <div className="h-24 w-full mt-2">
                         <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={eloHistory}>
                             <defs>
                               <linearGradient id="colorElo" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                 <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                               </linearGradient>
                             </defs>
                             <Tooltip
                               contentStyle={{
                                 backgroundColor: '#1e293b',
                                 border: '1px solid #334155',
                                 borderRadius: '8px',
                                 color: '#f1f5f9'
                               }}
                               formatter={(value) => [`${value} pts`, 'ELO']}
                             />
                             <Area
                               type="monotone"
                               dataKey="elo"
                               stroke="#f97316"
                               strokeWidth={2}
                               fillOpacity={1}
                               fill="url(#colorElo)"
                             />
                           </AreaChart>
                         </ResponsiveContainer>
                       </div>
                       <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                         <span>{eloHistory[0]?.date || 'Début'}</span>
                         <span className={`font-bold ${eloDelta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                           {eloDelta >= 0 ? '+' : ''}{eloDelta} pts
                         </span>
                         <span>{eloHistory[eloHistory.length - 1]?.date || 'Aujourd\'hui'}</span>
                       </div>
                     </div>
                   )}

                   <div className="grid grid-cols-2 gap-3 mt-4">
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                       <div className="text-xs text-slate-500 mb-1">Terrains visités</div>
                       <div className="text-lg font-bold text-white">12</div>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                       <div className="text-xs text-slate-500 mb-1">Sessions cette semaine</div>
                       <div className="text-lg font-bold text-white">8</div>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                       <div className="text-xs text-slate-500 mb-1">Moyenne Vibe Check</div>
                       <div className="text-lg font-bold text-white">4.6/5</div>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                       <div className="text-xs text-slate-500 mb-1">Jours actifs</div>
                       <div className="text-lg font-bold text-white">24/30</div>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Historique des matchs */}
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                 <h3 className="font-bold text-sm text-slate-400 mb-3 uppercase tracking-wide flex items-center justify-between">
                   <span className="flex items-center"><Calendar size={14} className="mr-2 text-orange-500" /> Historique</span>
                   <button className="text-xs text-slate-500 hover:text-white">Voir tout</button>
                 </h3>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                       <div className="flex items-center space-x-2">
                         <span className="w-2 h-2 rounded-full bg-green-500"></span>
                         <div>
                           <span className="text-sm font-bold text-white block">Victoire</span>
                           <span className="text-xs text-slate-500">vs Thomas R. • Il y a 2 jours</span>
                         </div>
                       </div>
                       <div className="text-right">
                         <span className="text-green-500 text-xs font-mono font-bold block">+12 pts</span>
                         <span className="text-xs text-slate-500">21-18</span>
                       </div>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                       <div className="flex items-center space-x-2">
                         <span className="w-2 h-2 rounded-full bg-red-500"></span>
                         <div>
                           <span className="text-sm font-bold text-white block">Défaite</span>
                           <span className="text-xs text-slate-500">vs Sarah B. • Il y a 4 jours</span>
                         </div>
                       </div>
                       <div className="text-right">
                         <span className="text-red-500 text-xs font-mono font-bold block">-8 pts</span>
                         <span className="text-xs text-slate-500">15-21</span>
                       </div>
                    </div>
                    <div className="flex justify-between items-center">
                       <div className="flex items-center space-x-2">
                         <span className="w-2 h-2 rounded-full bg-green-500"></span>
                         <div>
                           <span className="text-sm font-bold text-white block">Victoire</span>
                           <span className="text-xs text-slate-500">vs Moussa D. • Il y a 1 semaine</span>
                         </div>
                       </div>
                       <div className="text-right">
                         <span className="text-green-500 text-xs font-mono font-bold block">+15 pts</span>
                         <span className="text-xs text-slate-500">21-12</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Terrains favoris */}
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                 <h3 className="font-bold text-sm text-slate-400 mb-3 uppercase tracking-wide flex items-center justify-between">
                   <span className="flex items-center"><Heart size={14} className="mr-2 text-red-500 fill-current" /> Terrains favoris</span>
                   <button className="text-xs text-slate-500 hover:text-white">Voir tout</button>
                 </h3>
                 <div className="space-y-2">
                   {courtsData.filter(c => c.favorite).map((court) => (
                     <div key={court.id} onClick={() => { setSelectedCourt(court); setActiveTab('radar'); }} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${court.status === 'hot' ? 'bg-red-500/10 text-red-500' : court.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-slate-700/30 text-slate-500'}`}>
                             {court.status === 'hot' ? <Flame size={20} /> : <MapPin size={20} />}
                           </div>
                           <div>
                             <div className="font-bold text-white text-sm">{court.name}</div>
                             <div className="text-xs text-slate-400">{court.distance} • {court.visits} visites</div>
                           </div>
                         </div>
                         <ChevronRight size={16} className="text-slate-600" />
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* --- BOTTOM BAR --- */}
      <div className="fixed bottom-0 w-full bg-slate-950/90 backdrop-blur-xl border-t border-white/5 pb-safe px-6 py-2 z-50">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {['radar', 'leaderboard', 'profile'].map((tab) => (
             <motion.button
               key={tab}
               whileTap={{ scale: 0.9 }}
               onClick={() => {
                 setActiveTab(tab);
                 vibrate(50);
               }}
               className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-300 ${activeTab === tab ? 'text-orange-500 bg-orange-500/10' : 'text-slate-500 hover:text-slate-300'}`}
             >
               {tab === 'radar' && (
                 <motion.div
                   animate={activeTab === tab ? { scale: [1, 1.2, 1] } : {}}
                   transition={{ duration: 0.3 }}
                 >
                   <Target size={24} className={activeTab === tab ? 'fill-current' : ''} />
                 </motion.div>
               )}
               {tab === 'leaderboard' && (
                 <motion.div
                   animate={activeTab === tab ? { scale: [1, 1.2, 1] } : {}}
                   transition={{ duration: 0.3 }}
                 >
                   <Trophy size={24} className={activeTab === tab ? 'fill-current' : ''} />
                 </motion.div>
               )}
               {tab === 'profile' && (
                 <motion.div
                   animate={activeTab === tab ? { scale: [1, 1.2, 1] } : {}}
                   transition={{ duration: 0.3 }}
                 >
                   <User size={24} className={activeTab === tab ? 'fill-current' : ''} />
                 </motion.div>
               )}
             </motion.button>
          ))}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. DETAIL TERRAIN (Le Hub Central) */}
      {selectedCourt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-in slide-in-from-bottom-10 duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCourt(null)}></div>
          <div className="bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700 shadow-2xl relative z-10 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-5 sm:hidden"></div>
            <div className="px-6 pb-12">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h2 className="text-2xl font-bold text-white leading-tight">{selectedCourt.name}</h2>
                   <div className="flex items-center text-slate-400 mt-1 text-sm"><MapPin size={14} className="mr-1 text-orange-500" /> {selectedCourt.distance}</div>
                </div>
                <button onClick={() => setSelectedCourt(null)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700"><X size={20}/></button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge type={selectedCourt.status} className="flex items-center"><Flame size={10} className="mr-1"/>{selectedCourt.status}</Badge>
                <Badge type="vibe">{selectedCourt.vibe}</Badge>
                {selectedCourt.vibeScore && (
                  <Badge type="info" className="flex items-center">
                    <Star size={10} className="mr-1 text-yellow-500 fill-current"/> {selectedCourt.vibeScore}/5
                  </Badge>
                )}
                {selectedCourt.lighting && <Badge type="info" icon={Zap}>Éclairé</Badge>}
                {selectedCourt.water && <Badge type="info" icon={Gift}>Eau</Badge>}
                {selectedCourt.favorite && <Badge type="warning" icon={Heart}>Favori</Badge>}
              </div>

              {/* Stats rapides */}
              {(selectedCourt.visits !== undefined || selectedCourt.mvp) && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 text-center">
                    <div className="text-lg font-bold text-white">{selectedCourt.visits || 0}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Visites</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 text-center">
                    <div className="text-lg font-bold text-white text-xs">{selectedCourt.lastVisit || 'Jamais'}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Dernière</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 text-center">
                    <div className="text-lg font-bold text-white">{selectedCourt.mvp?.daysReigning || 0}j</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Règne MVP</div>
                  </div>
                </div>
              )}

              {/* SIGNAL BUTTONS */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={mySignal === 'coming'}
                  onClick={() => {
                    handleSignal('coming');
                    vibrate(50);
                  }}
                  className={`py-4 rounded-2xl font-bold flex flex-col items-center justify-center transition-all ${mySignal === 'coming' ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 shadow-lg'}`}
                >
                  <Clock size={20} className="mb-2 text-blue-400" /> J'arrive (15m)
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={mySignal === 'here'}
                  onClick={() => {
                    handleSignal('here');
                    vibrate(50);
                  }}
                  className={`py-4 rounded-2xl font-bold flex flex-col items-center justify-center transition-all ${mySignal === 'here' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-lg shadow-orange-600/20 border border-orange-400/20'}`}
                >
                  {signaling ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <MapPin size={20} className="mb-2 fill-white" />
                    </motion.div>
                  )}
                  {!signaling && <span>J'y suis !</span>}
                </motion.button>
              </div>

              {/* ACTIVE SESSION */}
              {selectedCourt.activeSession && (
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-4 border border-green-500/30 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Radio size={16} className="text-green-400 animate-pulse" />
                      <span className="text-sm font-bold text-white">Session Active</span>
                      <Badge type="active">Depuis {selectedCourt.activeSession.startTime}</Badge>
                    </div>
                    <button onClick={() => setShowSessionDetails(true)} className="text-xs text-slate-400 hover:text-white">
                      Voir détails
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    {selectedCourt.activeSession.players.slice(0, 4).map((player) => (
                      <div key={player.id} className="relative">
                        <img src={player.avatar} className="w-8 h-8 rounded-full border-2 border-slate-800" />
                        {player.status === 'playing' && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                        )}
                      </div>
                    ))}
                    {selectedCourt.activeSession.players.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                        +{selectedCourt.activeSession.players.length - 4}
                      </div>
                    )}
                    <span className="text-xs text-slate-400 ml-2">
                      {selectedCourt.activeSession.players.filter(p => p.status === 'playing').length} en jeu
                    </span>
                  </div>
                  <button onClick={() => setShowVibeCheck(true)} className="w-full bg-slate-800/50 text-white py-2 rounded-lg border border-slate-700 text-xs font-bold flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors">
                    <Activity size={14} /> Faire un Vibe Check
                  </button>
                </div>
              )}

              {/* PHOTOS */}
              {selectedCourt.photos && selectedCourt.photos.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-300 flex items-center">
                      <Camera size={14} className="mr-2 text-orange-500" /> Photos du terrain
                    </h3>
                    <button onClick={() => setShowPhotos(true)} className="text-xs text-slate-400 hover:text-white">
                      Voir tout
                    </button>
                  </div>
                  <div className="flex space-x-2 overflow-x-auto custom-scrollbar pb-2">
                    {selectedCourt.photos.slice(0, 3).map((photo, idx) => (
                      <div key={idx} className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-slate-700">
                        <img src={photo} className="w-full h-full object-cover" alt={`Terrain ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GAME & CHAT ACTIONS */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button onClick={() => setShowGameModal(true)} className="bg-slate-800 text-white py-3 rounded-xl border border-slate-700 font-bold flex items-center justify-center space-x-2 hover:bg-slate-700 active:scale-[0.98] transition-all">
                  <Swords size={18} className="text-yellow-500" /><span className="text-xs">Match</span>
                </button>
                <button onClick={() => setShowChatModal(true)} className="bg-slate-800 text-white py-3 rounded-xl border border-slate-700 font-bold flex items-center justify-center space-x-2 hover:bg-slate-700 active:scale-[0.98] transition-all">
                  <MessageSquare size={18} className="text-orange-500" /><span className="text-xs">Chat</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-6">
                 {/* MVP */}
                 {selectedCourt.mvp && (
                   <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative"><img src={selectedCourt.mvp.avatar} alt={selectedCourt.mvp.name} className="w-10 h-10 rounded-full border-2 border-yellow-500" /><div className="absolute -top-2 -right-1"><Crown size={14} className="fill-yellow-500 text-yellow-500" /></div></div>
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">MVP du terrain</div>
                        <div className="font-bold text-white text-sm">{selectedCourt.mvp.name}</div>
                        {selectedCourt.mvp.daysReigning && (
                          <div className="text-xs text-slate-500 mt-0.5">Règne depuis {selectedCourt.mvp.daysReigning} jours</div>
                        )}
                      </div>
                    </div>
                    <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                      <Target size={16} className="text-yellow-500" />
                    </button>
                  </div>
                 )}
                {/* Chat Trigger */}
                <div onClick={() => setShowChatModal(true)} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                   <div className="flex justify-between items-center mb-2">
                      <div className="text-xs font-bold text-slate-300 flex items-center"><MessageSquare size={12} className="mr-2 text-orange-500"/> Crew Chat ({selectedCourt.chatCount})</div>
                      <ChevronRight size={14} className="text-slate-500" />
                   </div>
                   <div className="space-y-2 opacity-70"><div className="flex items-center space-x-2"><img src={LEADERBOARD[1].avatar} className="w-5 h-5 rounded-full grayscale" /><p className="text-xs text-slate-400 truncate">On est 3 au playground...</p></div></div>
                </div>
              </div>

              {/* Actions supplémentaires */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button onClick={() => toggleFavorite(selectedCourt.id)} className="py-2.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2">
                  <Heart size={16} className={selectedCourt.favorite ? "text-red-500 fill-current" : ""} />
                  <span>{selectedCourt.favorite ? 'Favori' : 'Ajouter'}</span>
                </button>
                <button onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${selectedCourt.name} - StreetSignal`,
                      text: `Rejoins-moi au ${selectedCourt.name} ! ${selectedCourt.players} joueurs présents.`,
                      url: window.location.href
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(`${selectedCourt.name} - ${selectedCourt.distance} - ${selectedCourt.players} joueurs`);
                    triggerNotif("Lien copié ! 📋", "Partage le lien avec tes amis.", 'success');
                  }
                }} className="py-2.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2">
                  <Share2 size={16} />
                  <span>Partager</span>
                </button>
              </div>

              {/* Maintenance */}
              <button onClick={() => setShowReportModal(true)} className="w-full py-3 text-sm text-slate-400 hover:text-white border border-dashed border-slate-700 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center group">
                <Shield size={16} className="mr-2 group-hover:text-purple-400 transition-colors" /> Signaler un problème (+50 Karma)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SHOP MODAL (B2B) */}
      <Modal isOpen={showShop} onClose={() => setShowShop(false)} title="Street Shop" fullScreen>
         <div className="p-4">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-center text-white mb-8 shadow-lg shadow-purple-500/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={120} /></div>
               <div className="relative z-10">
                 <h2 className="text-3xl font-bold mb-1">{userKarma}</h2>
                 <p className="text-xs uppercase tracking-widest font-medium opacity-80">Points Karma</p>
                 <p className="text-xs mt-4 bg-white/20 inline-block px-3 py-1 rounded-full">Gagnez du Karma en signalant des problèmes.</p>
               </div>
            </div>
            <h3 className="font-bold text-lg text-white mb-4 flex items-center"><Gift size={18} className="mr-2 text-orange-500"/> Offres Partenaires</h3>
            <div className="grid grid-cols-1 gap-4">
              {SHOP_OFFERS.map((offer) => (
                <div key={offer.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex items-center justify-between group hover:border-orange-500/50 transition-colors">
                   <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2"><span className="text-black font-black text-[10px] leading-tight text-center">{offer.brand}</span></div>
                     <div><h4 className="font-bold text-white text-sm">{offer.title}</h4><p className="text-xs text-slate-400">{offer.desc}</p></div>
                   </div>
                   <button onClick={() => handleRedeem(offer.cost)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${userKarma >= offer.cost ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>{offer.cost} K</button>
                </div>
              ))}
            </div>
         </div>
      </Modal>

      {/* 3. CHAT MODAL (CREW) */}
      <Modal isOpen={showChatModal} onClose={() => setShowChatModal(false)} title={`Chat: ${selectedCourt?.name}`}>
         <div className="h-[400px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-3 p-2">
               {MESSAGES.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    {!msg.isMe && <div className="w-6 h-6 rounded-full bg-slate-700 mr-2 flex-shrink-0 flex items-center justify-center overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user}`} /></div>}
                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs ${msg.isMe ? 'bg-orange-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                       {!msg.isMe && <div className="font-bold text-[10px] text-orange-400 mb-1">{msg.user}</div>}
                       {msg.text}
                       <div className={`text-[9px] mt-1 text-right ${msg.isMe ? 'text-orange-200' : 'text-slate-500'}`}>{msg.time}</div>
                    </div>
                 </div>
               ))}
               <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-2 flex gap-2 border-t border-slate-800 pt-3">
               <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Message au crew..." className="flex-1 bg-slate-950 border border-slate-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"/>
               <button type="submit" className="p-2 bg-orange-600 rounded-full text-white hover:bg-orange-500"><Send size={16} /></button>
            </form>
         </div>
      </Modal>

      {/* 4. GAME MODAL (ELO) */}
      <Modal isOpen={showGameModal} onClose={() => setShowGameModal(false)} title="Résultat du match">
         <form onSubmit={handleGameSubmit} className="space-y-6">
            <div className="text-center">
               <p className="text-sm text-slate-400 mb-4">Double validation requise pour le ELO.</p>
               <div className="flex justify-center items-center gap-6 mb-6">
                  <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 w-24">
                    <div className="text-xs text-slate-500 mb-1">VOUS</div>
                    <input type="number" name="myScore" defaultValue="21" min="0" max="50" className="w-full bg-transparent text-3xl font-black text-white text-center focus:outline-none" />
                  </div>
                  <span className="text-slate-600 font-bold text-xl">:</span>
                  <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 w-24">
                    <div className="text-xs text-slate-500 mb-1">EUX</div>
                    <input type="number" name="opponentScore" defaultValue="18" min="0" max="50" className="w-full bg-transparent text-3xl font-black text-white text-center focus:outline-none" />
                  </div>
               </div>
               <div className="text-left">
                 <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Adversaire</label>
                 <select name="opponent" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none focus:border-orange-500">
                   <option>Sarah B.</option>
                   <option>Thomas R.</option>
                   <option>Moussa D.</option>
                 </select>
               </div>
            </div>
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-500 transition-colors shadow-lg shadow-green-600/20">Valider</button>
         </form>
      </Modal>

      {/* 5. REPORT MODAL (B2G) */}
      <Modal isOpen={showReportModal} onClose={() => { setShowReportModal(false); setReportPhoto(null); setTicketNumber(null); }} title="Maintenance Terrain">
         <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg flex items-start">
              <Shield size={16} className="text-purple-400 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-purple-200">Partenariat Smart City : Vos signalements aident la Mairie à prioriser les réparations.</p>
            </div>

            {!reportPhoto && !ticketNumber && (
              <div className="grid grid-cols-2 gap-2">
                {['Panneau', 'Filet', 'Sol', 'Éclairage', 'Déchets', 'Sécurité'].map((opt) => (
                  <motion.button
                    key={opt}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleReport(opt)}
                    className="text-left px-3 py-3 bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition-all flex items-center justify-between group"
                  >
                    {opt}
                    <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>
            )}

            {reportPhoto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="relative rounded-xl overflow-hidden border border-slate-700">
                  <img src={reportPhoto} alt="Photo du problème" className="w-full h-48 object-cover" />
                  <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded-lg text-xs text-white flex items-center space-x-1">
                    <Camera size={12} />
                    <span>Photo prise</span>
                  </div>
                </div>
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl"
                  >
                    <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white mb-1">Ticket créé !</p>
                    <p className="text-xs text-slate-400">
                      Ticket #{ticketNumber} ouvert par les Services Techniques de {currentUser.city}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}
         </div>
      </Modal>

      {/* 6. NOTIFICATIONS */}
      <Modal isOpen={showNotifs} onClose={() => setShowNotifs(false)} title="Notifications">
          <div className="space-y-3">
            {NOTIFICATIONS.filter(n => !n.read).length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nouvelles</h4>
                {NOTIFICATIONS.filter(n => !n.read).map((notif) => (
                  <div key={notif.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex gap-4 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'game' ? 'bg-orange-500/20 text-orange-400' : notif.type === 'signal' ? 'bg-green-500/20 text-green-400' : notif.type === 'vibe' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {notif.type === 'game' ? <Swords size={18} /> : notif.type === 'signal' ? <Radio size={18} /> : notif.type === 'vibe' ? <Activity size={18} /> : <Bell size={18} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                          <span className="text-[10px] text-slate-500">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{notif.text}</p>
                        {notif.action && (
                          <div className="flex gap-2 mt-3">
                            <button className="flex-1 bg-green-500/10 text-green-400 border border-green-500/50 py-1.5 rounded-lg text-xs font-bold hover:bg-green-500/20 transition-colors">Confirmer</button>
                            <button className="flex-1 bg-red-500/10 text-red-400 border border-red-500/50 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors">Refuser</button>
                          </div>
                        )}
                      </div>
                  </div>
                ))}
              </div>
            )}
            {NOTIFICATIONS.filter(n => n.read).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Plus tôt</h4>
                {NOTIFICATIONS.filter(n => n.read).map((notif) => (
                  <div key={notif.id} className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 flex gap-4 mb-3 opacity-70">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'game' ? 'bg-orange-500/10 text-orange-500/50' : notif.type === 'signal' ? 'bg-green-500/10 text-green-500/50' : notif.type === 'vibe' ? 'bg-purple-500/10 text-purple-500/50' : 'bg-blue-500/10 text-blue-500/50'}`}>
                        {notif.type === 'game' ? <Swords size={18} /> : notif.type === 'signal' ? <Radio size={18} /> : notif.type === 'vibe' ? <Activity size={18} /> : <Bell size={18} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-slate-400">{notif.title}</h4>
                          <span className="text-[10px] text-slate-600">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{notif.text}</p>
                      </div>
                  </div>
                ))}
              </div>
            )}
            {NOTIFICATIONS.length === 0 && (
              <div className="text-center py-12">
                <Bell size={48} className="text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 text-sm">Aucune notification</p>
              </div>
            )}
          </div>
      </Modal>

      {/* 7. VIBE CHECK MODAL */}
      <Modal isOpen={showVibeCheck} onClose={() => setShowVibeCheck(false)} title="Vibe Check">
        <div className="space-y-6">
          <p className="text-sm text-slate-400 text-center">Évalue l'ambiance actuelle du terrain</p>
          {selectedCourt && selectedCourt.activeSession && selectedCourt.activeSession.vibeRatings && (
            <div className="space-y-4">
              {Object.entries(selectedCourt.activeSession.vibeRatings).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-white capitalize">{key === 'competition' ? 'Compétition' : key === 'skill' ? 'Niveau' : key === 'friendly' ? 'Convivialité' : 'Intensité'}</span>
                    <span className="text-sm text-slate-400">{value}/10</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{width: `${value * 10}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 mb-3">Votre évaluation</p>
            <div className="space-y-4">
              {['Compétition', 'Niveau', 'Convivialité', 'Intensité'].map((label) => (
                <div key={label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-white">{label}</span>
                    <span className="text-sm text-slate-400">5/10</span>
                  </div>
                  <input type="range" min="1" max="10" defaultValue="5" className="w-full accent-orange-500" />
                </div>
              ))}
            </div>
            <button onClick={() => handleVibeCheck(selectedCourt?.id, { competition: 8, skill: 7, friendly: 9, intensity: 8 })} className="w-full mt-4 bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-500 transition-colors">
              Enregistrer le Vibe Check
            </button>
          </div>
        </div>
      </Modal>

      {/* 8. SESSION DETAILS MODAL */}
      <Modal isOpen={showSessionDetails} onClose={() => setShowSessionDetails(false)} title="Session Active">
        {selectedCourt && selectedCourt.activeSession && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Démarrée à</div>
                  <div className="text-lg font-bold text-white">{selectedCourt.activeSession.startTime}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Joueurs</div>
                  <div className="text-lg font-bold text-green-400">{selectedCourt.activeSession.players.length}</div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-300 mb-3">Joueurs présents</h4>
              <div className="space-y-2">
                {selectedCourt.activeSession.players.map((player) => (
                  <div key={player.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={player.avatar} className="w-10 h-10 rounded-full" />
                      <div>
                        <div className="font-bold text-white text-sm">{player.name}</div>
                        <div className="text-xs text-slate-500">{player.status === 'playing' ? 'En jeu' : 'En attente'}</div>
                      </div>
                    </div>
                    {player.status === 'playing' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {selectedCourt.activeSession.vibeRatings && (
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-3">Vibe Check actuel</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedCourt.activeSession.vibeRatings).map(([key, value]) => (
                    <div key={key} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{key === 'competition' ? 'Compétition' : key === 'skill' ? 'Niveau' : key === 'friendly' ? 'Convivialité' : 'Intensité'}</div>
                      <div className="text-lg font-bold text-white">{value}/10</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 9. PHOTOS MODAL */}
      <Modal isOpen={showPhotos} onClose={() => setShowPhotos(false)} title="Photos du terrain" fullScreen>
        {selectedCourt && selectedCourt.photos && selectedCourt.photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {selectedCourt.photos.map((photo, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-700">
                <img src={photo} className="w-full h-full object-cover" alt={`Photo ${idx + 1}`} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <Camera size={48} className="text-slate-700 mb-4" />
            <p className="text-slate-500 text-sm">Aucune photo disponible</p>
            <button className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-500 transition-colors">
              Ajouter une photo
            </button>
          </div>
        )}
      </Modal>

      {/* 10. SEARCH MODAL */}
      <Modal isOpen={showSearch} onClose={() => { setShowSearch(false); setSearchQuery(''); }} title="Rechercher un terrain">
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nom du terrain, ville, quartier..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              autoFocus
            />
          </div>
          {searchQuery && (
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {filteredCourts.length > 0 ? (
                filteredCourts.map((court) => (
                  <div key={court.id} onClick={() => { setSelectedCourt(court); setShowSearch(false); }} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${court.status === 'hot' ? 'bg-red-500/10 text-red-500' : court.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-slate-700/30 text-slate-500'}`}>
                        {court.status === 'hot' ? <Flame size={20} /> : <MapPin size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm">{court.name}</div>
                        <div className="text-xs text-slate-400 flex items-center space-x-2 mt-1">
                          <span>{court.distance}</span>
                          <span>•</span>
                          <span>{court.players} joueurs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">Aucun terrain trouvé</div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* TOAST NOTIFICATION SYSTEM */}
      {notification && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm p-4 rounded-2xl shadow-2xl border flex items-start z-[100] animate-in slide-in-from-top-5 fade-in duration-300 backdrop-blur-md ${notification.type === 'karma' ? 'bg-purple-900/90 border-purple-500/50 text-purple-100' : notification.type === 'error' ? 'bg-red-900/90 border-red-500/50 text-red-100' : 'bg-slate-800/95 border-slate-600 text-white'}`}>
          <div className="mr-3 mt-0.5">{notification.type === 'karma' ? <Shield size={18} /> : notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} className="text-green-400"/>}</div>
          <div><h4 className="font-bold text-sm">{notification.title}</h4><p className="text-xs opacity-90 leading-tight mt-1">{notification.message}</p></div>
        </div>
      )}

      {/* ONBOARDING */}
      {showOnboarding && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          defaultCity={currentUser.city}
          onCityUpdate={(city) => setCurrentUser(prev => ({ ...prev, city }))}
        />
      )}

      {/* TUTORIAL */}
      <Tutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)}
        onStepHighlight={(element) => setHighlightedElement(element)}
      />

      {/* SETTINGS MODAL */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Paramètres">
        <div className="space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h4 className="font-bold text-sm text-white mb-3">Mode Démo</h4>
            <p className="text-xs text-slate-400 mb-4">
              {demoMode 
                ? "Vous êtes en mode démo. La position est simulée à Nantes."
                : "Mode normal avec géolocalisation réelle."}
            </p>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h4 className="font-bold text-sm text-white mb-3">Données</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Terrains sauvegardés:</span>
                <span className="text-white">{courtsData.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Favoris:</span>
                <span className="text-white">{favorites.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Karma:</span>
                <span className="text-white">{userKarma}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données de démo ?')) {
                resetDemoData();
              }
            }}
            className="w-full py-3 bg-red-600/20 text-red-400 border border-red-600/50 rounded-xl font-bold hover:bg-red-600/30 transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw size={18} />
            <span>Réinitialiser la démo</span>
          </button>
        </div>
      </Modal>

    </div>
  );
}