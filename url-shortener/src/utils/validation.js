import logger from '../services/logger.js';

export function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL is required'
    };
  }

  const trimmedUrl = url.trim();
  
  if (!trimmedUrl) {
    return {
      isValid: false,
      error: 'URL cannot be empty'
    };
  }

  if (trimmedUrl.length < 4) {
    return {
      isValid: false,
      error: 'URL is too short'
    };
  }

  if (trimmedUrl.length > 2048) {
    return {
      isValid: false,
      error: 'URL is too long (maximum 2048 characters)'
    };
  }

  try {
    const urlObj = new URL(trimmedUrl);

    const allowedProtocols = ['http:', 'https:', 'ftp:', 'ftps:'];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'URL must use http, https, ftp, or ftps protocol'
      };
    }

    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return {
        isValid: false,
        error: 'URL must have a valid hostname'
      };
    }

    const hostname = urlObj.hostname.toLowerCase();
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    const isPrivateIP = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname);

    if (isLocalhost || isPrivateIP) {
      logger.info('Local or private IP detected in URL', { hostname });
    }

    return {
      isValid: true,
      error: null,
      normalizedUrl: urlObj.href
    };

  } catch (error) {
    return {
      isValid: false,
      error: 'Please enter a valid URL (include http:// or https://)'
    };
  }
}

export function validateValidityMinutes(minutes) {
  if (minutes === '' || minutes === null || minutes === undefined) {
    return {
      isValid: false,
      error: 'Validity period is required'
    };
  }

  const numMinutes = parseInt(minutes, 10);

  if (isNaN(numMinutes)) {
    return {
      isValid: false,
      error: 'Validity period must be a number'
    };
  }

  if (numMinutes < 1) {
    return {
      isValid: false,
      error: 'Validity period must be at least 1 minute'
    };
  }

  if (numMinutes > 525600) {
    return {
      isValid: false,
      error: 'Validity period cannot exceed 1 year (525600 minutes)'
    };
  }

  if (numMinutes > 10080) {
    logger.info('Long validity period specified', { minutes: numMinutes });
  }

  return {
    isValid: true,
    error: null,
    normalizedMinutes: numMinutes
  };
}

export function validateShortcode(shortcode, existsChecker = null) {
  if (!shortcode || shortcode.trim() === '') {
    return {
      isValid: true,
      error: null,
      normalizedShortcode: ''
    };
  }

  const trimmedShortcode = shortcode.trim();

  if (trimmedShortcode.length < 3) {
    return {
      isValid: false,
      error: 'Custom shortcode must be at least 3 characters long'
    };
  }

  if (trimmedShortcode.length > 50) {
    return {
      isValid: false,
      error: 'Custom shortcode cannot exceed 50 characters'
    };
  }

  if (!/^[a-zA-Z0-9]+$/.test(trimmedShortcode)) {
    return {
      isValid: false,
      error: 'Custom shortcode can only contain letters and numbers'
    };
  }
  const reservedWords = [
    'api', 'admin', 'www', 'mail', 'ftp', 'localhost', 'stats', 'statistics',
    'dashboard', 'login', 'register', 'signup', 'signin', 'logout', 'home',
    'about', 'contact', 'help', 'support', 'terms', 'privacy', 'policy',
    'legal', 'docs', 'documentation', 'blog', 'news', 'app', 'mobile',
    'download', 'upload', 'file', 'files', 'image', 'images', 'video',
    'videos', 'audio', 'music', 'static', 'assets', 'css', 'js', 'javascript',
    'html', 'xml', 'json', 'txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx',
    'ppt', 'pptx', 'zip', 'rar', 'tar', 'gz', 'exe', 'dmg', 'pkg', 'deb',
    'rpm', 'msi', 'iso', 'img'
  ];

  if (reservedWords.includes(trimmedShortcode.toLowerCase())) {
    return {
      isValid: false,
      error: 'This shortcode is reserved and cannot be used'
    };
  }

  if (existsChecker && typeof existsChecker === 'function') {
    try {
      if (existsChecker(trimmedShortcode)) {
        return {
          isValid: false,
          error: 'This shortcode is already taken'
        };
      }
    } catch (error) {
      logger.error('Error checking shortcode existence', error.message);
      return {
        isValid: false,
        error: 'Unable to verify shortcode availability'
      };
    }
  }

  return {
    isValid: true,
    error: null,
    normalizedShortcode: trimmedShortcode
  };
}

export function validateUrlBatch(urlInputs, shortcodeExistsChecker = null) {
  const errors = [];
  const validInputs = [];
  const usedShortcodes = new Set();

  const hasValidInputs = urlInputs.some(input => input.longUrl && input.longUrl.trim());

  if (!hasValidInputs) {
    return {
      isValid: false,
      error: 'Please enter at least one URL to shorten',
      errors: [],
      validInputs: []
    };
  }

  urlInputs.forEach((input, index) => {
    const inputErrors = {};

    if (!input.longUrl || !input.longUrl.trim()) {
      return;
    }

    const urlValidation = validateUrl(input.longUrl);
    if (!urlValidation.isValid) {
      inputErrors.longUrl = urlValidation.error;
    }

    const validityValidation = validateValidityMinutes(input.validityMinutes);
    if (!validityValidation.isValid) {
      inputErrors.validityMinutes = validityValidation.error;
    }

    const shortcodeValidation = validateShortcode(input.customShortcode, shortcodeExistsChecker);
    if (!shortcodeValidation.isValid) {
      inputErrors.customShortcode = shortcodeValidation.error;
    } else if (shortcodeValidation.normalizedShortcode) {
      const normalizedShortcode = shortcodeValidation.normalizedShortcode.toLowerCase();
      if (usedShortcodes.has(normalizedShortcode)) {
        inputErrors.customShortcode = 'Duplicate shortcode in form';
      } else {
        usedShortcodes.add(normalizedShortcode);
      }
    }

    if (Object.keys(inputErrors).length > 0) {
      errors[index] = inputErrors;
    } else {
      validInputs.push({
        ...input,
        index,
        normalizedUrl: urlValidation.normalizedUrl,
        normalizedMinutes: validityValidation.normalizedMinutes,
        normalizedShortcode: shortcodeValidation.normalizedShortcode
      });
    }
  });

  return {
    isValid: errors.length === 0,
    error: null,
    errors,
    validInputs
  };
}

export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>'"&]/g, (char) => {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    });
}

export function validateFormData(_formData) {
  const errors = {};
  const normalizedData = {};

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData
  };
}
