import * as C from './constants';

chrome.extension.sendRequest({intent: C.INTENT.GET_LOG }, response => {
  let log = response.log;
  $('#log').text(log);
});

$('#filter').on('change', e => {
  let filter = e.target.selectedOptions[0].value;
  console.log('filter: ' + filter);
  chrome.extension.sendRequest({intent: C.INTENT.GET_LOG }, response => {
    let log = response.log;
    log = log.split('\0')
             .filter(line => { return line.search(new RegExp(filter)) === 25; } )
             .join('');
    $('#log').text(log);
  });
});

$('#clear').on('click', e => {
  if(window.confirm('Are you sure?')) {
    chrome.extension.sendRequest({ intent: C.INTENT.CLEAR_LOG }, resp => {
      $('#log').text('');
      window.alert('Complete.');
    });
  }
});