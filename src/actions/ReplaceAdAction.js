import BaseAction from './BaseAction';
import * as C from '../constants';
import Logger from '../Logger';

const AD_AREA_COMMENT_PATTERN = /.*ad *card.*/i;
const CONTENT_TEXTAREA = '#Contents'
const AD_AREA_REPLACE_CONTENT_PATTERN = /^[ \t]*<!-- *\S* *ad *card *-->(?:.|\n)*<!-- *\S* *ad *card *-->[ \t]*$/img
const PIXELS_AREA_REPLACE_CONTENT_PATTERN = /<\/table>((?:.|\n)*<\/body>)/im

class ReplaceAdAction extends BaseAction {
  _execute() {
    this.content = $(CONTENT_TEXTAREA).val();
    let parser = new DOMParser();
    this.contentDom = parser.parseFromString(this.content, 'text/html');  
    this._doReplacing();
  }

  _doReplacing() {
    Logger.debug('Start replacing ad');
    let errormsg;

    let adCard = this._getCommentNodes(this.contentDom).filter(commentNode => {
      return commentNode.nodeValue.match(AD_AREA_COMMENT_PATTERN);
    });
    Logger.debug('Ad card comment node count: ' + adCard.length);

    if(adCard.length === 2) {
      let [start, end] = adCard;
      let elements = this._getRangeNodes(start, end).filter(node => { return node.nodeType === 1; });
      Logger.debug('Ad area elements count: ' + elements.length);
      if(elements.length === 1 && elements[0].tagName === 'TR') {
        let tr = elements[0]; // ad row
        let a = $(tr).find('a');
        let img = a.children('img');

        Logger.debug('In Ad area TR element, found <a>: ' + a.length + '<img> in <a>: ' + img.length);
        if(a.length === 1 && img.length === 1) {
          // do real stuff
          this._getReplacingInfo(info => {
            a.prop('href', info.linkUrl);
            img.prop('src', info.imgSource);

            let adReplacingArea = this.content.match(AD_AREA_REPLACE_CONTENT_PATTERN)
            if(adReplacingArea !== null && adReplacingArea.length === 1) {
              let newAdArea = '<!-- Start Ad Card -->\n' +
                              tr.outerHTML.replace(/&amp;/g, '&') +
                              '\n<!-- End Ad Card -->';
              Logger.info('\n====Replacing AD:==== \n' + adReplacingArea[0] + '\n====with:====\n' + newAdArea);
              this.content = this.content.replace(adReplacingArea[0], newAdArea);
              this._doReplacePixels(info.pixelsSnippet);
              this._saveChanges();
            } else {
              errormsg = 'AD is not replaced. Because: Can not match replacing area.'
            }
          });
        } else {
          errormsg = 'AD is not replaced. Because: Expect 1 <a> tag and 1 <img> tag in <tr> tag.';
        }
      } else {
        errormsg = 'AD is not replaced. Because: Expect there is 1 (and only 1) TR tag between two ad card comments.';
      }
    } else {
      errormsg = 'AD is not replaced. Because: Expect ad card comment is 2 but actually is ' + adCard.length;
    }

    if (errormsg !== undefined) {
      Logger.error(errormsg);
      Logger.error('Pixels Snippet is not replaced. Because: AD is not replaced.');
    }
  }

  _saveChanges() {
    $(CONTENT_TEXTAREA).val(this.content);
    // mock. not really submit changes

    this._triggerEvent(C.CONTENT_PAGE_EVENTS.REPLACED_AD, () => {
      window.close();
    });
  }

  _doReplacePixels(pixelsSnippet) {
    let newPixelsSnippet = '</table>\n' +
                           pixelsSnippet +
                           '\n</body>';
    let area = this._findPixelsArea();
    if (area.isFound) {
      Logger.debug('index: ' + area.index + ' length: ' + area.length);
      // replace snippet, do real stuff
      Logger.info('\n====Replacing Pixels Snippet:==== \n' +
                  this.content.substring(area.index, area.index + area.length) +
                  '\n====with:====\n' +
                  newPixelsSnippet);

      this.content = this.content.substring(0, area.index) +
                     newPixelsSnippet + 
                     this.content.substring(area.index + area.length);

    } else{
      Logger.error('Pixels Snippet is not replaced. Because: Can not find the area.');
    }
  }

  _findPixelsArea() {
    let offset = 0, index, length, searchContent = this.content;
    // find the last </table>...</body>
    while(true) {
      let matches = searchContent.match(PIXELS_AREA_REPLACE_CONTENT_PATTERN);
      if(matches === null) {
        break;
      } else {
        index = matches.index + offset;
        offset += matches.index + 8; // '</table>'.length
        length = matches[0].length;
        searchContent = matches[1];
      }
    }

    return { isFound: length !== undefined, index: index, length: length };
  }

  _getCommentNodes(node) {
    if(node.hasChildNodes !== undefined && node.hasChildNodes()) {
      console.log(node.nodeName + ', ' + node.nodeType + ',' + node.childNodes.length)
      let childNodes = node.childNodes;
      let commentNodes = [];
      for(let i in childNodes) {
        let childNode = childNodes[i];
        commentNodes = commentNodes.concat(this._getCommentNodes(childNode));
      }
      return commentNodes;
    } else {
      if(node.nodeType === 8) {
        return [node];
      } else {
        return [];
      }
    }
  }

  _getRangeNodes(start, end) {
    let p = start.nextSibling;
    let rangeNodes = []
    while(p !== end) {
      rangeNodes.push(p);
      p = p.nextSibling;
    }
    return rangeNodes;
  }
}

export default ReplaceAdAction;
