import BaseAction from './BaseAction';
import Logger from '../Logger';
import * as C from '../constants';

class ReplaceAdCompleteAction extends BaseAction {
  _execute() {
    Logger.info('Saving AD completed.')
    this._triggerEvent(C.CONTENT_PAGE_EVENTS.REPLACED_AD, () => {
      window.close();
    });
  }
}

export default ReplaceAdCompleteAction;