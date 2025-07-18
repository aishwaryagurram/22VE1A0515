import React, { useState } from 'react';
import logger from '../services/logger.js';
import storageService from '../services/storageService.js';
import { 
  isValidUrl, 
  isAlphanumeric, 
  generateShortcode, 
  createShortenedUrl 
} from '../utils/dataModels.js';

const UrlShortenerForm = ({ onUrlsShortened }) => {
  const [urlInputs, setUrlInputs] = useState([
    { longUrl: '', validityMinutes: 30, customShortcode: '', errors: {} }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const addUrlInput = () => {
    if (urlInputs.length < 5) {
      setUrlInputs([
        ...urlInputs,
        { longUrl: '', validityMinutes: 30, customShortcode: '', errors: {} }
      ]);
      logger.userAction('Added new URL input', { totalInputs: urlInputs.length + 1 });
    }
  };

  const removeUrlInput = (index) => {
    if (urlInputs.length > 1) {
      const newInputs = urlInputs.filter((_, i) => i !== index);
      setUrlInputs(newInputs);
      logger.userAction('Removed URL input', { index, remainingInputs: newInputs.length });
    }
  };

  const updateUrlInput = (index, field, value) => {
    const newInputs = [...urlInputs];
    newInputs[index] = {
      ...newInputs[index],
      [field]: value,
      errors: { ...newInputs[index].errors, [field]: '' }
    };
    setUrlInputs(newInputs);
    setGlobalError('');
  };

  const validateUrlInput = (input, index) => {
    const errors = {};

    if (!input.longUrl.trim()) {
      errors.longUrl = 'URL is required';
    } else if (!isValidUrl(input.longUrl.trim())) {
      errors.longUrl = 'Please enter a valid URL (include http:// or https://)';
    }

    const validity = parseInt(input.validityMinutes);
    if (isNaN(validity) || validity < 1 || validity > 10080) {
      errors.validityMinutes = 'Validity must be between 1 and 10080 minutes (1 week)';
    }

    if (input.customShortcode.trim()) {
      const shortcode = input.customShortcode.trim();
      if (!isAlphanumeric(shortcode)) {
        errors.customShortcode = 'Shortcode must contain only letters and numbers';
      } else if (shortcode.length < 3 || shortcode.length > 20) {
        errors.customShortcode = 'Shortcode must be between 3 and 20 characters';
      } else if (storageService.shortcodeExists(shortcode)) {
        errors.customShortcode = 'This shortcode is already taken';
      }
    }

    return errors;
  };

  const validateAllInputs = () => {
    let isValid = true;
    const newInputs = [...urlInputs];
    const usedShortcodes = new Set();

    const hasValidInputs = urlInputs.some(input => input.longUrl.trim());
    if (!hasValidInputs) {
      setGlobalError('Please enter at least one URL to shorten');
      return false;
    }

    newInputs.forEach((input, index) => {
      if (input.longUrl.trim()) {
        const errors = validateUrlInput(input, index);

        const shortcode = input.customShortcode.trim();
        if (shortcode) {
          if (usedShortcodes.has(shortcode.toLowerCase())) {
            errors.customShortcode = 'Duplicate shortcode in form';
          } else {
            usedShortcodes.add(shortcode.toLowerCase());
          }
        }

        if (Object.keys(errors).length > 0) {
          isValid = false;
        }

        newInputs[index].errors = errors;
      }
    });

    setUrlInputs(newInputs);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGlobalError('');

    logger.userAction('Form submission started', { inputCount: urlInputs.length });

    try {
      if (!validateAllInputs()) {
        setIsSubmitting(false);
        logger.validation('form', 'Validation failed');
        return;
      }

      const validInputs = urlInputs.filter(input => input.longUrl.trim());
      const shortenedUrls = [];

      for (const input of validInputs) {
        let shortcode = input.customShortcode.trim();
        if (!shortcode) {
          do {
            shortcode = generateShortcode(6);
          } while (storageService.shortcodeExists(shortcode));
        }

        const shortenedUrl = createShortenedUrl(
          input.longUrl.trim(),
          shortcode,
          parseInt(input.validityMinutes)
        );

        if (storageService.saveUrl(shortenedUrl)) {
          shortenedUrls.push(shortenedUrl);
          logger.success(`URL shortened successfully`, { shortcode });
        } else {
          throw new Error(`Failed to save URL with shortcode: ${shortcode}`);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      if (onUrlsShortened) {
        onUrlsShortened(shortenedUrls);
      }

      setUrlInputs([
        { longUrl: '', validityMinutes: 30, customShortcode: '', errors: {} }
      ]);

      logger.success(`Successfully shortened ${shortenedUrls.length} URLs`);

    } catch (error) {
      logger.error('Failed to shorten URLs', error.message);
      setGlobalError('Failed to shorten URLs. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="url-shortener-form">
      <h2>Shorten Your URLs</h2>
      <p className="form-description">
        You can shorten up to 5 URLs at once. Each URL can have a custom validity period and shortcode.
      </p>

      <form onSubmit={handleSubmit} className="shortener-form">
        {globalError && (
          <div className="error-message global-error">
            {globalError}
          </div>
        )}

        {urlInputs.map((input, index) => (
          <div key={index} className="url-input-group">
            <div className="input-header">
              <h3>URL #{index + 1}</h3>
              {urlInputs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrlInput(index)}
                  className="remove-button"
                  aria-label={`Remove URL ${index + 1}`}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="input-row">
              <div className="input-field">
                <label htmlFor={`longUrl-${index}`}>
                  Long URL <span className="required">*</span>
                </label>
                <input
                  type="url"
                  id={`longUrl-${index}`}
                  value={input.longUrl}
                  onChange={(e) => updateUrlInput(index, 'longUrl', e.target.value)}
                  placeholder="https://example.com/very-long-url"
                  className={input.errors.longUrl ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {input.errors.longUrl && (
                  <span className="error-text">{input.errors.longUrl}</span>
                )}
              </div>

              <div className="input-field validity-field">
                <label htmlFor={`validity-${index}`}>
                  Validity (minutes)
                </label>
                <input
                  type="number"
                  id={`validity-${index}`}
                  value={input.validityMinutes}
                  onChange={(e) => updateUrlInput(index, 'validityMinutes', e.target.value)}
                  min="1"
                  max="10080"
                  className={input.errors.validityMinutes ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {input.errors.validityMinutes && (
                  <span className="error-text">{input.errors.validityMinutes}</span>
                )}
              </div>

              <div className="input-field">
                <label htmlFor={`shortcode-${index}`}>
                  Custom Shortcode (optional)
                </label>
                <input
                  type="text"
                  id={`shortcode-${index}`}
                  value={input.customShortcode}
                  onChange={(e) => updateUrlInput(index, 'customShortcode', e.target.value)}
                  placeholder="mycode123"
                  maxLength="20"
                  className={input.errors.customShortcode ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {input.errors.customShortcode && (
                  <span className="error-text">{input.errors.customShortcode}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="form-actions">
          {urlInputs.length < 5 && (
            <button
              type="button"
              onClick={addUrlInput}
              className="add-button"
              disabled={isSubmitting}
            >
              + Add Another URL
            </button>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Shortening...' : 'Shorten URLs'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UrlShortenerForm;
