// Service de reverse geocoding avec Nominatim (OpenStreetMap)
export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'StreetSignal/1.0' // Requis par Nominatim
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    // Extraire la ville depuis l'adresse
    const address = data.address || {};
    const city = 
      address.city || 
      address.town || 
      address.village || 
      address.municipality ||
      address.county ||
      'Ville inconnue';
    
    return {
      city,
      fullAddress: data.display_name,
      country: address.country || 'France'
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      city: null,
      fullAddress: null,
      country: 'France'
    };
  }
}

