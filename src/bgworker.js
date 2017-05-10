import * as C from './constants';
import Logger from './Logger';

// init log
if(localStorage.log === undefined) {
  localStorage.log = '';
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
        appCurrentPage: localStorage.appCurrentPage
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
      let message = request.message;
      let level = request.level;
      let timenow = new Date().toISOString();
      let log = `${timenow} ${level} ${message}\n`;
      console.log(log);
      localStorage.log += log;
      sendResponse({});
      break;
    case C.INTENT.GET_LOG:
      sendResponse({ log: localStorage.log });
      break;
    default:
      sendResponse({});
  }
});
