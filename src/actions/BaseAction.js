import * as C from '../constants';
import Logger from '../Logger';

class BaseAction {
  executeWithAppRunning() {
    chrome.extension.sendRequest({ intent: C.INTENT.GET_APP_STATUS }, response => {
      if(response.appStatus === C.APP_STATUS.RUNNING) {
        this._pushCurrentPage();
        this._execute();
      }
    });
  }

  _execute() {}

  _waitFor(what, then) {
    if(what()) {
      then();
    } else {
      setTimeout(() => { this._waitFor(what, then) }, 500);
    }
  }

  _need(selectors, then, context = document) {
    Logger.debug(`BaseAction#_need: selectors = ${selectors}, then = ${then.name}`)
    let $context = $(context);
    this._waitFor(() => {
      if(selectors instanceof Array) {
        let existings = selectors.filter(s => { return $context.find(s).length > 0 });
        Logger.debug(`BaseAction#_need: selectors = ${selectors.length}, existings = ${existings.length}`)
        return existings.length === selectors.length;
      } else {
        let existingLength = $context.find(selectors).length
        Logger.debug(`BaseAction#_need: existingLength = ${existingLength}`)
        return existingLength > 0;
      }
    }, then);
  }

  _needInIframe(iframe, expectingDocURL, selectors, then) {
    this._waitFor(() => {
      Logger.debug('iframe content doc URL: ' + iframe.contentDocument.URL +
                    ', expecting URL: ' + expectingDocURL +
                    ', readyState: ' + iframe.contentDocument.readyState);
      return iframe.contentDocument.URL === expectingDocURL && 
             iframe.contentDocument.readyState === 'complete';
    }, () => {
      this._need(selectors, then, iframe.contentDocument);
    });
  }

  _pushStatus(status) {
    chrome.extension.sendRequest(
      Object.assign(status, { intent: C.INTENT.PUSH_APP_STATUS })
    );
  }

  _pushCurrentPage() {
    this._pushStatus({ appCurrentPage: document.location.pathname });
  }

  _getStatus(callback) {
    chrome.extension.sendRequest({ intent: C.INTENT.GET_APP_STATUS }, callback);
  }

  _getReplacingInfo(callback) {
    chrome.extension.sendRequest({ intent: C.INTENT.GET_REPLACING_INFO }, callback);
  }

  _triggerEvent(event, callback) {
    chrome.extension.sendRequest({ intent: C.INTENT.TRIGGER_EVENT, event: event }, resp => {
      callback();
    });
  }
}

export default BaseAction;