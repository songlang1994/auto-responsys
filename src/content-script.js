import LoginAction from './actions/LoginAction';
import GoToFoldersPageAction from './actions/GoToFoldersPageAction';
import ContentPageAction from './actions/ContentPageAction';
import ReplaceAdAction from './actions/ReplaceAdAction';
import GoToLinkTableAction from './actions/GoToLinkTableAction';
import AddLinkTableAction from './actions/AddLinkTableAction';

$(document).ready(() => {
  let pathname = document.location.pathname;
  switch(pathname) {
    // login page
    case '/authentication/login/LoginPage':
      new LoginAction().executeWithAppRunning();
      break;
    // after login
    case '/suite/c':
      new GoToFoldersPageAction().executeWithAppRunning();
      break;
    // folder page
    case '/interact/jsp/jindex.jsp':
      new ContentPageAction().executeWithAppRunning();
      break;
    // edit AD HTML page
    case '/interact/formcab/FileEdit':
      new ReplaceAdAction().executeWithAppRunning();
      break;
    // link table
    case '/interact/jsp/en/lists/DataViewer.jsp':
      new GoToLinkTableAction().executeWithAppRunning();
      break;
    // link table edit
    case '/interact/jsp/en/lists/DataViewerEditRow.jsp':
      new AddLinkTableAction().executeWithAppRunning();
      break;
  }
});
