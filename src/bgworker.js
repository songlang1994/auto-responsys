import * as C from './constants';
import Logger from './Logger';

// init log
if(localStorage.log === undefined) {
  localStorage.log = '';
}

let globalvars = {};

function writeLog(level, message) {
  let timenow = new Date().toISOString();
  let log = `${timenow} ${level} ${message}\n`;
  console.log(log);
  localStorage.log += log;
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
        appHandledWeeks: localStorage.appHandledWeeks ? JSON.parse(localStorage.appHandledWeeks) : [],
        appCurrentPage: localStorage.appCurrentPage,
        appContentPageId: localStorage.appContentPageId
      });
      break;
    case C.INTENT.PUSH_APP_STATUS:
      if(request.appStatus !== undefined) localStorage.appStatus = request.appStatus;
      if(request.appHandledWeeks !== undefined) localStorage.appHandledWeeks = request.appHandledWeeks;
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
    case C.INTENT.PUSH_BACKUP:
      let timenow = new Date().toISOString();
      localStorage[`${timenow}/${request.backupName}`] = request.backupContent;
      sendResponse({});
      break;
    case C.INTENT.TRIGGER_EVENT:
      chrome.windows.getAll(windows => {
        for(let i in windows) {
          let w = windows[i];
          if(w !== undefined) {
            chrome.tabs.getAllInWindow(w.id, tabs => {
              let tab = tabs.find(tab => { return tab.url === 'https://interact2.responsys.net/interact/jsp/jindex.jsp' });
              if(tab !== undefined) {
                writeLog('DEBUG', 'Found tab id: ' + tab.id);
                chrome.tabs.sendMessage(tab.id, { event: request.event }, resp => {
                  sendResponse({});
                });
              }
            });
          }
        }
      });
    default:
      sendResponse({});
  }
});
