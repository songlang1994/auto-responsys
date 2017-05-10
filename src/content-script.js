import LoginAction from './actions/LoginAction';
import GoToFoldersPageAction from './actions/GoToFoldersPageAction';
import ContentPageAction from './actions/ContentPageAction';
import ReplaceAdAction from './actions/ReplaceAdAction';

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
    default:
      // ignore
  }
});
