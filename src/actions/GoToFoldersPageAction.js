import BaseAction from './BaseAction';
import * as C from '../constants';

const FOLDERS = '#ext-element-74';

class GoToFoldersPageAction extends BaseAction {
  _execute() {
    this._need(FOLDERS, this._doGoToFoldersPage);
  }

  _doGoToFoldersPage() {
    $(FOLDERS).click()
  }
}

export default GoToFoldersPageAction;
