/**
 * Data Models for URL Shortener Application
 */

/**
 * Generates a random alphanumeric shortcode
 * @param {number} length - Length of the shortcode
 * @returns {string} Random shortcode
 */
export function generateShortcode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validates if a string is alphanumeric
 * @param {string} str - String to validate
 * @returns {boolean} True if alphanumeric
 */
export function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a new shortened URL object
 * @param {string} longUrl - Original URL
 * @param {string} shortcode - Short code for the URL
 * @param {number} validityMinutes - Validity period in minutes
 * @returns {Object} Shortened URL object
 */
export function createShortenedUrl(longUrl, shortcode, validityMinutes = 30) {
  const now = new Date();
  const expiryTime = new Date(now.getTime() + validityMinutes * 60000);
  
  return {
    id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    longUrl,
    shortcode,
    shortUrl: `${window.location.origin}/${shortcode}`,
    createdAt: now.toISOString(),
    expiryTime: expiryTime.toISOString(),
    validityMinutes,
    totalClicks: 0,
    isActive: true
  };
}

/**
 * Creates a new click log entry
 * @param {string} shortcode - The shortcode that was clicked
 * @param {string} referrer - Referrer URL
 * @param {string} userAgent - User agent string
 * @returns {Object} Click log object
 */
export function createClickLog(shortcode, referrer = '', userAgent = '') {
  return {
    id: `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    shortcode,
    timestamp: new Date().toISOString(),
    referrer: referrer || 'Direct',
    userAgent,
    location: generateMockLocation(),
    ipAddress: generateMockIP()
  };
}

function generateMockLocation() {
  const locations = [
    { city: 'New York', country: 'USA', region: 'NY' },
    { city: 'London', country: 'UK', region: 'England' },
    { city: 'Tokyo', country: 'Japan', region: 'Kanto' },
    { city: 'Sydney', country: 'Australia', region: 'NSW' },
    { city: 'Toronto', country: 'Canada', region: 'ON' },
    { city: 'Berlin', country: 'Germany', region: 'Berlin' },
    { city: 'Paris', country: 'France', region: 'Île-de-France' },
    { city: 'Mumbai', country: 'India', region: 'Maharashtra' }
  ];
  
  return locations[Math.floor(Math.random() * locations.length)];
}

function generateMockIP() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

export function isUrlValid(shortenedUrl) {
  if (!shortenedUrl || !shortenedUrl.isActive) {
    return false;
  }
  
  const now = new Date();
  const expiryTime = new Date(shortenedUrl.expiryTime);
  
  return now < expiryTime;
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export function getTimeRemaining(expiryTime) {
  const now = new Date();
  const expiry = new Date(expiryTime);
  const diff = expiry - now;
  
  if (diff <= 0) {
    return 'Expired';
  }
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  }
}
