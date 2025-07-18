/**
 * Storage Service for URL Shortener
 * Handles localStorage operations for persistence
 */

import logger from './logger.js';
import { createClickLog } from '../utils/dataModels.js';

class StorageService {
  constructor() {
    this.URLS_KEY = 'url_shortener_urls';
    this.CLICKS_KEY = 'url_shortener_clicks';
    this.SETTINGS_KEY = 'url_shortener_settings';
  }

  /**
   * Get all shortened URLs from localStorage
   * @returns {Array} Array of shortened URL objects
   */
  getAllUrls() {
    try {
      const urls = localStorage.getItem(this.URLS_KEY);
      const parsedUrls = urls ? JSON.parse(urls) : [];
      logger.info(`Retrieved ${parsedUrls.length} URLs from storage`);
      return parsedUrls;
    } catch (error) {
      logger.error('Failed to retrieve URLs from storage', error.message);
      return [];
    }
  }

  /**
   * Save a new shortened URL
   * @param {Object} urlData - Shortened URL object
   * @returns {boolean} Success status
   */
  saveUrl(urlData) {
    try {
      const existingUrls = this.getAllUrls();
      existingUrls.push(urlData);
      localStorage.setItem(this.URLS_KEY, JSON.stringify(existingUrls));
      logger.success(`Saved URL with shortcode: ${urlData.shortcode}`);
      return true;
    } catch (error) {
      logger.error('Failed to save URL to storage', error.message);
      return false;
    }
  }

  /**
   * Get a shortened URL by shortcode
   * @param {string} shortcode - The shortcode to search for
   * @returns {Object|null} Shortened URL object or null if not found
   */
  getUrlByShortcode(shortcode) {
    try {
      const urls = this.getAllUrls();
      const url = urls.find(u => u.shortcode === shortcode);
      if (url) {
        logger.info(`Found URL for shortcode: ${shortcode}`);
      } else {
        logger.info(`No URL found for shortcode: ${shortcode}`);
      }
      return url || null;
    } catch (error) {
      logger.error('Failed to retrieve URL by shortcode', error.message);
      return null;
    }
  }

  /**
   * Check if a shortcode already exists
   * @param {string} shortcode - The shortcode to check
   * @returns {boolean} True if shortcode exists
   */
  shortcodeExists(shortcode) {
    const url = this.getUrlByShortcode(shortcode);
    return url !== null;
  }

  /**
   * Update URL click count
   * @param {string} shortcode - The shortcode that was clicked
   * @returns {boolean} Success status
   */
  incrementClickCount(shortcode) {
    try {
      const urls = this.getAllUrls();
      const urlIndex = urls.findIndex(u => u.shortcode === shortcode);
      
      if (urlIndex !== -1) {
        urls[urlIndex].totalClicks = (urls[urlIndex].totalClicks || 0) + 1;
        localStorage.setItem(this.URLS_KEY, JSON.stringify(urls));
        logger.info(`Incremented click count for shortcode: ${shortcode}`);
        return true;
      }
      
      logger.error(`URL not found for shortcode: ${shortcode}`);
      return false;
    } catch (error) {
      logger.error('Failed to increment click count', error.message);
      return false;
    }
  }

  /**
   * Get all click logs from localStorage
   * @returns {Array} Array of click log objects
   */
  getAllClicks() {
    try {
      const clicks = localStorage.getItem(this.CLICKS_KEY);
      const parsedClicks = clicks ? JSON.parse(clicks) : [];
      logger.info(`Retrieved ${parsedClicks.length} click logs from storage`);
      return parsedClicks;
    } catch (error) {
      logger.error('Failed to retrieve click logs from storage', error.message);
      return [];
    }
  }

  /**
   * Save a click log entry
   * @param {string} shortcode - The shortcode that was clicked
   * @param {string} referrer - Referrer URL
   * @param {string} userAgent - User agent string
   * @returns {boolean} Success status
   */
  logClick(shortcode, referrer = '', userAgent = '') {
    try {
      const clickLog = createClickLog(shortcode, referrer, userAgent);
      const existingClicks = this.getAllClicks();
      existingClicks.push(clickLog);
      localStorage.setItem(this.CLICKS_KEY, JSON.stringify(existingClicks));
      logger.info(`Logged click for shortcode: ${shortcode}`);
      return true;
    } catch (error) {
      logger.error('Failed to log click', error.message);
      return false;
    }
  }

  /**
   * Get click logs for a specific shortcode
   * @param {string} shortcode - The shortcode to get clicks for
   * @returns {Array} Array of click log objects
   */
  getClicksForShortcode(shortcode) {
    try {
      const allClicks = this.getAllClicks();
      const shortcodeClicks = allClicks.filter(click => click.shortcode === shortcode);
      logger.info(`Retrieved ${shortcodeClicks.length} clicks for shortcode: ${shortcode}`);
      return shortcodeClicks;
    } catch (error) {
      logger.error('Failed to retrieve clicks for shortcode', error.message);
      return [];
    }
  }

  /**
   * Clear all data from localStorage
   * @returns {boolean} Success status
   */
  clearAllData() {
    try {
      localStorage.removeItem(this.URLS_KEY);
      localStorage.removeItem(this.CLICKS_KEY);
      localStorage.removeItem(this.SETTINGS_KEY);
      logger.success('Cleared all data from storage');
      return true;
    } catch (error) {
      logger.error('Failed to clear data from storage', error.message);
      return false;
    }
  }

  /**
   * Get application settings
   * @returns {Object} Settings object
   */
  getSettings() {
    try {
      const settings = localStorage.getItem(this.SETTINGS_KEY);
      return settings ? JSON.parse(settings) : {
        defaultValidityMinutes: 30,
        maxUrlsPerBatch: 5,
        enableLogging: true
      };
    } catch (error) {
      logger.error('Failed to retrieve settings', error.message);
      return {
        defaultValidityMinutes: 30,
        maxUrlsPerBatch: 5,
        enableLogging: true
      };
    }
  }

  /**
   * Save application settings
   * @param {Object} settings - Settings object
   * @returns {boolean} Success status
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      logger.success('Saved application settings');
      return true;
    } catch (error) {
      logger.error('Failed to save settings', error.message);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Object} Storage statistics
   */
  getStorageStats() {
    const urls = this.getAllUrls();
    const clicks = this.getAllClicks();
    
    return {
      totalUrls: urls.length,
      totalClicks: clicks.length,
      activeUrls: urls.filter(url => url.isActive).length,
      expiredUrls: urls.filter(url => !url.isActive || new Date(url.expiryTime) < new Date()).length
    };
  }
}

const storageService = new StorageService();

export default storageService;
