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
    this.$runBtn = $('#runBtn');
    this.$saveBtn = $('#saveBtn');
    this.$masking = $('#masking');
    this.$stopBtn = $('#stopBtn');
    this.$readonlyRunBtn = $('#readonlyRunBtn');
    this.$maskingText = $('#maskingText');
  }

  setupUI() {
    this._setupUserInfo();
    this._setupStage();
    this._setupMaskingText();

    if(localStorage.appStatus === C.APP_STATUS.RUNNING) {
      this.$masking.show();
    } else {
      this.$masking.hide();
    }

    this.$imgSource.val(localStorage.imgSource);
    this.$linkUrl.val(localStorage.linkUrl);
    this.$pixelsSnippet.val(localStorage.pixelsSnippet);
    this.$linkTableName.val(localStorage.linkTableName);

    this.$saveBtn.on('click', e => {
      this.saveUI();
      this.$prompt.text('保存成功');
    });

    this.$readonlyRunBtn.on('click', e => {
      localStorage.isReadonly = true;
      this._setupMaskingText();
      alert('只读模式不会更改任何东西。\n\n你可以放心地用这种方式运行，运行完成后，查看日志瞄一瞄程序的输出。');
      this._run();
    });

    this.$runBtn.on('click', e => {
      localStorage.isReadonly = false;
      this._setupMaskingText();
      this._run();
    });

    this.$stopBtn.on('click', this._stop.bind(this));
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
    if(JSON.parse(localStorage.stages).length === 0) {
      alert('至少选一个目标阶段。');
      return;
    }

    // save UI before every running
    this.saveUI();

    let pixelsSnippetStr = localStorage.pixelsSnippet.trim().length > 0 ?
                             localStorage.pixelsSnippet.trim() :
                             '不改变Pixels Snippet';
    let linkTableNameStr = localStorage.linkTableName.trim().length > 0 ?
                             localStorage.linkTableName.trim() :
                             '不加Link Table';
    let stagesStr = JSON.parse(localStorage.stages).map(s => { return `-  ${s.name}`; }).join('\n');

    let summary = []
    summary.push(`User Name:\t${localStorage.username}\n\n` +
                 `Password:\t${localStorage.password}`);

    summary.push(`Stages:\n\n` +
                 `${stagesStr}`);

    summary.push(`Image URL:\n\n` +
                 `${localStorage.imgSource}`);

    summary.push(`Link URL:\n\n` +
                  `${localStorage.linkUrl}`);

    summary.push(`Pixels Snippet:\n\n` +
                 `${pixelsSnippetStr}`);
                 
    summary.push(`Link Table Name:\n\n` +
                 `${linkTableNameStr}`);

    let confirmed = true;
    for(let i in summary) {
      let step = parseInt(i) + 1;
      let txt = `${step}/${summary.length} Please confirm\n\n\n${summary[i]}`;
      if(!confirm(txt)) {
        confirmed = false;
        break;
      }
    }

    if(confirmed) {
      localStorage.appStatus = C.APP_STATUS.RUNNING;
      this.$prompt.text('开始运行');
      this.$masking.show();
      chrome.windows.create({
        url: RS_LOGIN_URL
      });
    }
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
      $('#stages').append(
       `<div class="checkbox">
          <label>
            <input type="checkbox" value="${JSON.stringify(e)}">
              ${e.name}
          </label>
        </div>`
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

  _setupMaskingText() {
    let text = localStorage.isReadonly === 'true' ? '正在运行（只读）...' : '正在运行...';
    this.$maskingText.text(text);
  }
}

let popup = new Popup();
$(document).ready(popup.setupUI.bind(popup));
