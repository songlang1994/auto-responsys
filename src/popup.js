import * as C from './constants';

const RS_LOGIN_URL = 'https://interact2.responsys.net/authentication/login/LoginPage'

class Popup {
  constructor() {
    this.$username = $('#username');
    this.$password = $('#password');
    this.$imgSource = $('#imgSource');
    this.$linkUrl = $('#linkUrl');
    this.$pixelsSnippet = $('#pixelsSnippet');
    this.$linkTableName = $('#linkTableName');
    this.$prompt = $('#prompt');
    this.$clearLogBtn = $('#clearLogBtn');
    this.$runBtn = $('#runBtn');
    this.$saveBtn = $('#saveBtn');
    this.$masking = $('#masking');
    this.$stopBtn = $('#stopBtn');
  }

  setupUI() {
    this._setupUserInfo();
    this._setupStage();

    if(localStorage.appStatus === C.APP_STATUS.RUNNING) {
      this.$masking.show();
    }

    this.$imgSource.val(localStorage.imgSource);
    this.$linkUrl.val(localStorage.linkUrl);
    this.$pixelsSnippet.val(localStorage.pixelsSnippet);
    this.$linkTableName.val(localStorage.linkTableName);

    this.$saveBtn.on('click', e => {
      this.saveUI();
      this.$prompt.text('保存成功');
    });

    this.$runBtn.on('click', this._run.bind(this));
    this.$stopBtn.on('click', this._stop.bind(this));

    this.$clearLogBtn.on('click', e => {
      localStorage.log = '';
      this.$prompt.text('已清除日志');
    })
  }

  saveUI() {
    localStorage.username = this.$username.val();
    localStorage.password = this.$password.val();
    localStorage.imgSource = this.$imgSource.val();
    localStorage.linkUrl = this.$linkUrl.val();
    localStorage.pixelsSnippet = this.$pixelsSnippet.val();
    localStorage.linkTableName = this.$linkTableName.val();

    let stages = this.$stages.toArray()
                              .filter(e => { return e.checked; })
                              .map(e => { return JSON.parse(e.value); });
    localStorage.stages = JSON.stringify(stages);
  }

  _run() {
    localStorage.appStatus = C.APP_STATUS.RUNNING;
    this.$prompt.text('开始运行');

    chrome.windows.create({
      url: RS_LOGIN_URL
    });
  }

  _stop() {
    localStorage.appStatus = C.APP_STATUS.STOPPED;
    this.$masking.hide();
    this.$prompt.text('已停止');
  }

  _setupUserInfo() {
    this.$username.val(localStorage.username);
    this.$password.val(localStorage.password);
  }

  _setupStage() {
    // create stage checkboxes
    C.TB_STAGES.forEach(e => {
      $('#configForm .stages').append(
        `<label><input type="checkbox" class="stage" value='${JSON.stringify(e)}'>${e.name}</label>`
      );
    });

    this.$stages = $('.stage');
    let stages = localStorage.stages ? JSON.parse(localStorage.stages) : [];
    let stageNames = stages.map(e => { return e.name });
    this.$stages.each((i, e) => {
      if(stageNames.includes(e.parentElement.innerText)) {
        e.checked = true;
      }
    });
  }
}

let popup = new Popup();
$(document).ready(popup.setupUI.bind(popup));
