import BaseAction from './BaseAction';
import * as C from '../constants';
import Logger from '../Logger';

const FOLDER_LIST_IFRAME = '#main2';
const FOLDER_LIST_IFRAME_URL = 'https://interact2.responsys.net/interact/folder/List';
const CONTENT_PAGE_IFRAME_URL = 'https://interact2.responsys.net/interact/campaign/CampaignWizardDashboard?CampaignName='
const FOLDER_ITEMS = '#folderbox > span';
const PRENATAL_ITEMS_PATTERN = /^TB_Stages_New_PRE_Week(\d{2})_NewColors$/;
const POSTNATAL_ITEMS_PATTERN = /^TB_Stages_New_POST_Week(\d{2})(?:_Name)?$/;
const CONTENT_ITEMS = '#contentbox > span > a:first-of-type';
const CONTENT_EDIT_BTN = '#ui\\.campaignWizard\\.campaignDashboard\\.content + div > a:first-of-type';
const CONTENT_EDIT_BTN_EDIT = '#popHtmlInWizMenu #ui\\.popmenu\\.edit'

class ContentPageAction extends BaseAction {
  _execute() {
    alert(1);
    this._need(FOLDER_LIST_IFRAME, () => {
      this._needInIframe($(FOLDER_LIST_IFRAME)[0], FOLDER_LIST_IFRAME_URL, FOLDER_ITEMS, () => {
        this.$folderListDocument = $($(FOLDER_LIST_IFRAME)[0].contentDocument);

        this._getStages(stages => {
          this._getHandledWeeks(handledWeeks => {
            this.stages = stages;
            this.handledWeeks = handledWeeks;
            if(stages.length > 0) {
              this._doGoToContentPage(stages[0]);
            }
          });
        });

      });
    });
  }

  _doGoToContentPage(stage) {
    let folder = this._findFolder(stage.folder);
    $(folder).click();

    this._need(CONTENT_ITEMS, () => {
      let weeks = this._findWeeks(stage);
      let handlingWeek = weeks.find(week => { return !this.handledWeeks.includes(week.innerText) })
      if(handlingWeek !== undefined) {
        Logger.info(`Going to edit content page... Current handling week: ${handlingWeek.innerText}`);
        handlingWeek.click();
        this._doGoToEditPage(handlingWeek.innerText);
      } else {
        let index = this.stages.findIndex(e => { return e === stage});
        if (index < this.stages.length - 1) {
          _doGoToContentPage(this.stages[index + 1]);
        } else {
          // TODO end
        }
      }
    }, this.$folderListDocument[0]);
  }

  _doGoToEditPage(weekName) {
    this._needInIframe($(FOLDER_LIST_IFRAME)[0], CONTENT_PAGE_IFRAME_URL + weekName, CONTENT_EDIT_BTN, () => {
      this.$contentDocument = $($(FOLDER_LIST_IFRAME)[0].contentDocument);

      this.$contentDocument.find(CONTENT_EDIT_BTN)[0].click();
      this._need(CONTENT_EDIT_BTN_EDIT, () => {
        this.$contentDocument.find(CONTENT_EDIT_BTN_EDIT)[0].click();
      }, this.$contentDocument[0]);
    });
  }

  _forEachWeekPage(stage, callback) {
    
  }

  _findWeeks(stage) {
    Logger.debug(`_findWeeks: stage.folder = ${stage.folder}`);
    switch(stage.folder) {
      case C.TB_STAGE_FOLDERS.PRENATAL:
        return this._filterWeeks(stage, PRENATAL_ITEMS_PATTERN);
      case C.TB_STAGE_FOLDERS.POSTNATAL:
        return this._filterWeeks(stage, POSTNATAL_ITEMS_PATTERN);
      default:
        return [];
    }
  }

  _filterWeeks(stage, regex) {
    let startWeek = stage.weeksRange[0];
    let endWeek = stage.weeksRange[1];
    Logger.debug(`_filterWeeks: startWeek = ${startWeek}, endWeek = ${endWeek}`);
    return this.$folderListDocument
               .find(CONTENT_ITEMS)
               .toArray()
               .filter(e => {
                 let match = e.innerText.match(regex);
                 // Logger.debug(`_filterWeeks: innerText = ${e.innerText}, match = ${match}`);
                 if(match !== null && match.length > 1) {
                   let week = parseInt(match[1]);
                   // Logger.debug(`_filterWeeks: week = ${week}`);
                   return startWeek <= week && week <= endWeek;
                 }
                 return false;
               });
  }

  _findFolder(folderName) {
    let $folderItems = this.$folderListDocument.find(FOLDER_ITEMS);
    return $folderItems.toArray().find(e => { return folderName === e.innerText; });
  }

  _getStages(callback) {
    chrome.extension.sendRequest({ intent: C.INTENT.GET_TB_STAGES }, response => {
      callback(response.stages);
    });
  }

  _getHandledWeeks(callback) {
    this._getStatus(appStatus => {
      callback(appStatus.appHandledWeeks);
    });
  }
}

export default ContentPageAction;
