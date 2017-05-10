import BaseAction from './BaseAction';
import * as C from '../constants';

const USERNAME = '#txtUserName';
const PASSWORD = '#txtPassword';
const LOGIN_FORM = '#loginForm';

class LoginAction extends BaseAction {
  _execute() {
    this._need([USERNAME, PASSWORD, LOGIN_FORM], this._doLogin);
  }

  _doLogin() {
    chrome.extension.sendRequest({ intent: C.INTENT.USER_INFO }, response => {
      let username = response.username;
      let password = response.password;
      $(USERNAME).val(username);
      $(PASSWORD).val(password);
      $(LOGIN_FORM).submit();
    });
  }
}


export default LoginAction;