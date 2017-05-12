import BaseAction from './BaseAction';
import Logger from '../Logger';
import * as C from '../constants';

const NEW_RECORD = '#ui\\.data\\.newRecord'

class GoToLinkTableAction extends BaseAction {
  _execute() {
    this._need(NEW_RECORD, () => {
      $(NEW_RECORD)[0].click();  
    });
  }
}


export default GoToLinkTableAction;