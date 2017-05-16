import BaseAction from './BaseAction';
import Logger from '../Logger';
import * as C from '../constants';

const FORM = 'form[name="paginatedTable"]';
const LINK_NAME = 'input[name="LINK_NAME"]';
const LINK_URL = 'textarea[name="LINK_URL"]';
const DISABLE_TRACKING = 'input[name="chkEXTERNAL_TRACKING"]';

class AddLinkTableAction extends BaseAction {
  _execute() {
    Logger.info('Start to add link table.')
    this._fillForm();
  }

  _saveChanges() {
    Logger.info('Saving link table.')
    this._triggerEvent(C.CONTENT_PAGE_EVENTS.ADDED_LINK_TABLE, () => {
      window.close();
    });
  }

  _fillForm() {
    this._need(FORM, () => {
      let $form = $(FORM);
      let $linkName = $form.find(LINK_NAME);
      let $linkUrl = $form.find(LINK_URL);
      let $disableTracking = $form.find(DISABLE_TRACKING);

      this._getReplacingInfo(info => {
        $linkName.val(info.linkTableName);
        $linkUrl.val(info.linkUrl);
        $disableTracking[0].checked = true;

        Logger.info('Adding link table: name = ' + $linkName.val() + ', url = ' + $linkUrl.val() + 
                    ', disableTracking = ' + $disableTracking[0].checked);
        this._saveChanges();
      })
    });
  }
}


export default AddLinkTableAction;