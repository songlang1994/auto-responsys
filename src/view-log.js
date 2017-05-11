import * as C from './constants';

chrome.extension.sendRequest({intent: C.INTENT.GET_LOG }, response => {
  let log = response.log;
  $('#log').text(log);
});