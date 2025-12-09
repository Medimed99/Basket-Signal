// Feedback haptique pour interactions clés
export function vibrate(pattern = 200) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// Patterns de vibration prédéfinis
export const VibrationPatterns = {
  success: [100, 50, 100],
  error: [200, 100, 200],
  notification: 200,
  checkIn: [150, 50, 150],
  victory: [100, 50, 100, 50, 200]
};

