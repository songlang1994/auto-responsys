import BaseAction from './BaseAction';
import * as C from '../constants';


const LEFT_TOP_CORNER_MENU = '#uifhamburgerbutton-1012-btnIconEl';
const FOLDERS = '#menuitem-1028-textEl';

class GoToFoldersPageAction extends BaseAction {
  _execute() {
    this._need(LEFT_TOP_CORNER_MENU, this._doGoToFoldersPage);
  }

  _doGoToFoldersPage() {
    // click left-top corner menu
    $(LEFT_TOP_CORNER_MENU).click();
    // click "Folders"
    $(FOLDERS).click();
  }
}

export default GoToFoldersPageAction;
