import BaseAction from './BaseAction';
import Logger from '../Logger';
import * as C from '../constants';

const FORM = 'form[name="paginatedTable"]';
const LINK_NAME = 'input[name="LINK_NAME"]';
const LINK_URL = 'textarea[name="LINK_URL"]';
const DISABLE_TRACKING = 'input[name="chkEXTERNAL_TRACKING"]';
const SAVE_BTN = '#ui\\.common\\.save'

const PROMPT_CONTAINER = '#nwContent > div:first-child';
const SUCCESS_MESSAGE = 'Your new record is added successfully.'



class AddLinkTableAction extends BaseAction {
  _execute() {
    let prompt = $(PROMPT_CONTAINER).text();
    switch(prompt) {
      case '':
        Logger.info('Start to add link table.');
        this._fillForm();
        break;
      case SUCCESS_MESSAGE:
        Logger.info('Saving link table completed.');
        this._triggerEvent(C.CONTENT_PAGE_EVENTS.ADDED_LINK_TABLE, () => {
          window.close();
        });
        break;
      default:
        Logger.error('Unexpected message appeared on link table edit page.')
        // go ahead
        this._triggerEvent(C.CONTENT_PAGE_EVENTS.ADDED_LINK_TABLE, () => {
          window.close();
        });
    }
  }

  _saveChanges() {
    Logger.info('Saving link table...');
    $(SAVE_BTN)[0].click();
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