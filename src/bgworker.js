import * as C from './constants';
import Logger from './Logger';

// init log
if(localStorage.log === undefined) {
  localStorage.log = '';
}

function writeLog(level, message) {
  let timenow = new Date().toISOString();
  let log = `${timenow} ${level} ${message}\n\0`;
  console.log(log);
  localStorage.log += log;
}

function findTabByUrl(url, callback) {
  chrome.windows.getAll(windows => {
    for(let i in windows) {
      let w = windows[i];
      try {
        chrome.tabs.getAllInWindow(w.id, tabs => {
          try {
            let tab = tabs.find(tab => { return tab.url === url });
            if(tab !== undefined) {
              writeLog('DEBUG', 'Found tab id: ' + tab.id);
              callback(tab);
            }
          } catch(exception) {
            // ignore here. Occuring some undefined window or undefined tab error when window or tab is closed.
          }
        });
      } catch(exception) {
        // ignore here. Occuring some undefined window or undefined tab error when window or tab is closed.
      }
    }
  });
}

chrome.extension.onRequest.addListener((request, sender, sendResponse) => {
  switch(request.intent) {
    case C.INTENT.USER_INFO:
      sendResponse({
        username: localStorage.username,
        password: localStorage.password
      });
      break;
    case C.INTENT.GET_REPLACING_INFO:
      sendResponse({
        imgSource: localStorage.imgSource,
        linkUrl: localStorage.linkUrl,
        pixelsSnippet: localStorage.pixelsSnippet,
        linkTableName: localStorage.linkTableName
      });
      break;
    case C.INTENT.GET_APP_STATUS:
      sendResponse({
        appStatus: localStorage.appStatus,
        appCurrentPage: localStorage.appCurrentPage,
      });
      break;
    case C.INTENT.PUSH_APP_STATUS:
      if(request.appStatus !== undefined) localStorage.appStatus = request.appStatus;
      if(request.appCurrentPage !== undefined) localStorage.appCurrentPage = request.appCurrentPage;
      sendResponse({});
      break;
    case C.INTENT.GET_TB_STAGES:
      sendResponse({
        stages: localStorage.stages ? JSON.parse(localStorage.stages) : []
      });
      break;
    case C.INTENT.PUSH_LOG:
      writeLog(request.level, request.message);
      sendResponse({});
      break;
    case C.INTENT.GET_LOG:
      sendResponse({ log: localStorage.log });
      break;
    case C.INTENT.CLEAR_LOG:
      localStorage.log = '';
      sendResponse({});
      break;
    case C.INTENT.PUSH_BACKUP:
      let timenow = new Date().toISOString();
      localStorage[`${timenow}/${request.backupName}`] = request.backupContent;
      sendResponse({});
      break;
    case C.INTENT.TRIGGER_EVENT:
      findTabByUrl('https://interact2.responsys.net/interact/jsp/jindex.jsp', tab => {
        chrome.tabs.sendMessage(tab.id, { event: request.event }, resp => {
          sendResponse({});
        });
      });
    default:
      sendResponse({});
  }
});
