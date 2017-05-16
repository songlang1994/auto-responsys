import BaseAction from './BaseAction';
import * as C from '../constants';
import Logger from '../Logger';

const FOLDER_LIST_IFRAME = '#main2';
const FOLDER_LIST_IFRAME_URL = 'https://interact2.responsys.net/interact/folder/List';
const CONTENT_PAGE_IFRAME_URL_PREFIX = 'https://interact2.responsys.net/interact/campaign/CampaignWizardDashboard?CampaignName='
const FOLDER_ITEMS = '#folderbox > span';
const PRENATAL_ITEMS_PATTERN = /^TB_Stages_New_PRE_Week(\d{2})_NewColors$/;
const POSTNATAL_ITEMS_PATTERN = /^TB_Stages_New_POST_Week(\d{2})(?:_Name)?$/;
const CONTENT_ITEMS = '#contentbox > span > a:first-of-type';
const CONTENT_EDIT_BTN = '#ui\\.campaignWizard\\.campaignDashboard\\.content + div > a:first-of-type';
const CONTENT_EDIT_BTN_EDIT = '#popHtmlInWizMenu #ui\\.popmenu\\.edit'
const CONTENT_LINK_TABLE = '#ui\\.campaignWizard\\.campaignDashboard\\.linkTable + div > a:first-of-type'
const CONTENT_LINK_TABLE_EDIT = '#popLinkInWizMenu #ui\\.popmenu\\.viewEditData'
const LEFT_TOP_CORNER_MENU = '#uifhamburgerbutton-1012';
const MENU_ITEM_FOLDERS = '#menuitem-1028-itemEl';

const EVENT_FOLDER_CLICKED = 'rs:folderClicked';
const EVENT_WEEK_CLICKED = 'rs:weekClicked';
const EVENT_AD_REPLACED = 'rs:adReplaced';
const EVENT_LINK_TABLE_ADDED = 'rs:linkTableAdded';

class ContentPageAction extends BaseAction {
  _execute() {
    this._getStages(stages => {
      this.stages = stages;
      this.currentStageIndex = 0;
      this.currentWeekOnStage = this.stages[this.currentStageIndex].weeksRange[0];
      this._startListening();

      this._on(EVENT_FOLDER_CLICKED, (e, stage) => {
        this._goToContentPage(stage);
      });

      this._on(EVENT_WEEK_CLICKED, (e, weekName)=> {
        this._openReplacingAdPopup(weekName);
      });

      this._on(EVENT_AD_REPLACED, e => {
        this._openAddingLinkTablePopup();
      });

      this._on(EVENT_LINK_TABLE_ADDED, e => {
        this._returnToFolderListPage();
        this._changeCurrentWeek();
        this._handleCurrentWeek();
      });

      // Bootstrap
      this._handleCurrentWeek();
    });
  }

  _startListening() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      Logger.debug('ContentPageAction received a message.');
      switch(message.event) {
        case C.CONTENT_PAGE_EVENTS.REPLACED_AD:
          this._trigger(EVENT_AD_REPLACED);
          break;
        case C.CONTENT_PAGE_EVENTS.ADDED_LINK_TABLE:
          this._trigger(EVENT_LINK_TABLE_ADDED);
          break;
      }
      sendResponse({});
    });
  }

  _handleCurrentWeek() {
    if(this.currentStageIndex < 0) {
      this._pushStatus({ appStatus: C.APP_STATUS.STOPPED }); // Stop App
      Logger.info('Complete!');
      window.alert('Complete!');
      return;
    }

    this._need(FOLDER_LIST_IFRAME, () => {
      let currentStage = this.stages[this.currentStageIndex];
      this._openFolder(currentStage)
    });
  }

  _goToContentPage(stage) {
    this._need(CONTENT_ITEMS, () => {
      let currentWeek = this._findWeek(stage, this.currentWeekOnStage);
      let weekName = currentWeek.innerHTML;
      Logger.info(`Going to content page... Current week: ${weekName}`);
      currentWeek.click();
      this._trigger(EVENT_WEEK_CLICKED, weekName);
    }, this.context);
  }

  _openFolder(stage) {
    this._needInIframe($(FOLDER_LIST_IFRAME)[0], FOLDER_LIST_IFRAME_URL, FOLDER_ITEMS, () => {
      this._reloadContext();
      let $folderItems = this.$context.find(FOLDER_ITEMS);
      Logger.debug('folder items count: ' + $folderItems.length);
      let folder = $folderItems.toArray()
                              .find(e => { return stage.folder === e.innerText; });
      Logger.debug('folder name: ' + folder.innerHTML);
      folder.click();
      this._trigger(EVENT_FOLDER_CLICKED, stage);
    });
  }

  _openReplacingAdPopup(weekName) {
    this._needInIframe($(FOLDER_LIST_IFRAME)[0], CONTENT_PAGE_IFRAME_URL_PREFIX + weekName, CONTENT_EDIT_BTN, () => {
      this._reloadContext();
      this.$context.find(CONTENT_EDIT_BTN)[0].click();
      this._need(CONTENT_EDIT_BTN_EDIT, () => {
        this.$context.find(CONTENT_EDIT_BTN_EDIT)[0].click();
      }, this.context);
    });
  }

  _openAddingLinkTablePopup() {
    this._getReplacingInfo(info => {
      if(info.linkTableName.trim().length > 0) {
        this.$context.find(CONTENT_LINK_TABLE)[0].click();
        this._need(CONTENT_LINK_TABLE_EDIT, () => {
          this.$context.find(CONTENT_LINK_TABLE_EDIT)[0].click();
        }, this.context);
      } else {
        this._trigger(EVENT_LINK_TABLE_ADDED);
      }
    });
  }

  _returnToFolderListPage() {
    $(LEFT_TOP_CORNER_MENU)[0].click();
    $(MENU_ITEM_FOLDERS)[0].click();
  }

  _changeCurrentWeek() {
    let currentStage = this.stages[this.currentStageIndex];
    if(this.currentWeekOnStage < currentStage.weeksRange[1]) {
      this.currentWeekOnStage += 1;
      return;
    }

    if(this.currentStageIndex < this.stages.length - 1) {
      this.currentStageIndex += 1;
      currentStage = this.stages[this.currentStageIndex];
      this.currentWeekOnStage = currentStage.weeksRange[0];
      return;
    }

    this.currentStageIndex = -1;
    this.currentWeekOnStage = -1;
    return;
  }

  _findWeek(stage, weekOnStage) {
    Logger.debug(`_findWeek: stage.folder = ${stage.folder}, weekOnStage = ${weekOnStage}`);
    switch(stage.folder) {
      case C.TB_STAGE_FOLDERS.PRENATAL:
        return this._findWeek0(stage, weekOnStage, PRENATAL_ITEMS_PATTERN);
      case C.TB_STAGE_FOLDERS.POSTNATAL:
        return this._findWeek0(stage, weekOnStage, POSTNATAL_ITEMS_PATTERN);
      default:
        return;
    }
  }

  _findWeek0(stage, weekOnStage, regex) {
    let startWeek = stage.weeksRange[0];
    let endWeek = stage.weeksRange[1];
    return this.$context.find(CONTENT_ITEMS).toArray()
               .find(e => {
                 let match = e.innerText.match(regex);
                 if(match !== null && match.length > 1) {
                   let week = parseInt(match[1]);
                   return startWeek <= week && week <= endWeek && week === weekOnStage;
                 }
                 return false;
               });
  }

  _getStages(callback) {
    chrome.extension.sendRequest({ intent: C.INTENT.GET_TB_STAGES }, response => {
      callback(response.stages);
    });
  }

  _reloadContext() {
    this.context = $(FOLDER_LIST_IFRAME)[0].contentDocument;
    this.$context = $(this.context);
  }

  _on(event, callback) {
    $(document).on(event, callback);
  }

  _trigger(event, extra) {
    Logger.debug('Event ' + event + ' triggered.');
    $(document).trigger(event, extra);
  }
}

export default ContentPageAction;
