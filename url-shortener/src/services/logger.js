class Logger {
  constructor() {
    this.isEnabled = true;
    this.logs = [];
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }

  _log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    this.logs.push(logEntry);

    if (this.isEnabled) {
      const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

      switch (level) {
        case 'error':
          console.error(formattedMessage, data || '');
          break;
        case 'success':
          console.log(`✅ ${formattedMessage}`, data || '');
          break;
        case 'info':
        default:
          console.log(`ℹ️ ${formattedMessage}`, data || '');
          break;
      }
    }
  }

  info(message, data = null) {
    this._log('info', message, data);
  }

  success(message, data = null) {
    this._log('success', message, data);
  }

  error(message, data = null) {
    this._log('error', message, data);
  }

  api(method, url, data = null) {
    this.info(`API ${method.toUpperCase()} ${url}`, data);
  }

  validation(field, message) {
    this.error(`Validation Error - ${field}: ${message}`);
  }

  userAction(action, data = null) {
    this.info(`User Action: ${action}`, data);
  }
}

const logger = new Logger();

export default logger;
