import * as C from './constants';

$('body').css('height', window.innerHeight - 10);
window.onresize = e => {
  $('body').css('height', window.innerHeight - 10);
};

chrome.extension.sendRequest({intent: C.INTENT.GET_LOG }, response => {
  let log = response.log;
  $('#log').val(log);
});