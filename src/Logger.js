import * as C from './constants';

class Logger {
  static debug(message) {
    if(typeof(message) === 'string') {
      this._log('DEBUG', message);
    } else {
      this._log('DEBUG', JSON.stringify(message));
    }
  }

  static info(message) {
    this._log('INFO', message);
  }

  static warn(message) {
    this._log('WARNING', message);
  }

  static error(message) {
    this._log('ERROR', message);
  }

  static _log(level, message) {
    chrome.extension.sendRequest({
      intent: C.INTENT.PUSH_LOG,
      level: level,
      message: message
    });
  }
}

export default Logger;