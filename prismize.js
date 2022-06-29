"use strict";

/**
 * @preserve Copyright 2022 - Chris West - MIT Licensed
 * 
 * When this code is first executed it will call `prismizeAll()`.  The order of
 * precedence for the options is (1) the `opt_options` passed in to
 * `prismize()`, (2) the corresponding data attributes on any `code` element
 * passed to `prismize()`, and (3) the corresponding camel cased options as
 * defined in the URL of the script tag that defines and executes this code.
 */
var _ref = function (document, undefined) {
  /** @type {PrismizeOptions} */
  var DEFAULTS = Array.from((document.currentScript.src || '').replace(/\+/g, ' ').matchAll(/[?&]([^=&#]+)(?:=([^&#]*))?/g)).reduce(function (DEFAULTS, match) {
    var k = match[1];
    var v = match[2];
    DEFAULTS[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
    return DEFAULTS;
  }, {});
  DEFAULTS.templatePath = 'https://cdn.jsdelivr.net/npm/prismjs@[[version]]/[[path]]';
  /** @type {((string: action, string: code, iframe: HTMLElement, options: PrismizeOptions) => void)[]} */

  var globalHandlers = [];
  /**
   * @typedef {Object} PrismizeOptions
   * @property {{string: name, string: label}[]=} actions
   *   If specified this will indicate the extra buttons that should appear in
   *   the info bar before the copy and download buttons (if the are to be
   *   shown).
   * @property {string=} className
   *   Class name to assign to the IFRAME.
   * @property {(boolean|string)=} copyable
   *   If specified as `true` the code will have a copy to clipboard button in the
   *   info bar.  If specified as a string this will be the button text that will
   *   show in the info bar.
   * @property {string=} downloadName
   *   The name of the file when it is downloaded via the download button.
   * @property {(boolean|string)=} downloadable
   *   If specified as `true` the code will have a download button in the
   *   info bar.  If specified as a string this will be the button text that will
   *   show in the info bar.
   * @property {boolean=} endWithInfoBar
   *   If specified as `true` the info bar will be shown at after the code block
   *   instead of before the code block.  This is only relevant if something is
   *   to be shown in the info bar.
   * @property {string=} id
   *   The ID to assign to the IFRAME.
   * @property {string=} infoHTML
   *   The HTML that should be rendered in the info bar after the language tag
   *   but before any buttons.
   * @property {string=} infoText
   *   The text that should show in the info bar after the language tag but
   *   before any buttons.
   * @property {boolean=} matchBraces
   *   If specified as `true` the match braces plugin will be enabled.
   * @property {number=} maxHeight
   *   Maximum height of the content.
   * @property {(boolean|number)=} numberLines
   *   If specified as `true` or a number the lines will be numbered.  If
   *   specified as a number that will be used as the first line number to show.
   * @property {((iframe: HTMLElement, options: PrismizeOptions) => void)=} onLoad
   *   If specified this function will be called after the IFRAME is added to
   *   the DOM.
   * @property {((string: action, string: code, iframe: HTMLElement, options: PrismizeOptions) => void)=} onAction
   *   If specified this function will be called after a custom info bar button
   *   is clicked.
   * @property {((iframe: HTMLElement, options: PrismizeOptions) => void)=} onResize
   *   If specified this function will be called whenever the contents of the
   *   IFRAME have been resized.
   * @property {HTMLElement=} placeholder
   *   Element around where the IFRAME should be placed.  Defaults to
   *   `document.body`.
   * @property {("before"|"after"|"replace"|"end"|"start")=} placement
   *   Where to place the IFRAME in relation to `placeholder`.  Defaults to
   *   `"replace"` if `placeholder` is given, otherwise defaults to `"end"`.
   * @property {boolean=} previewColors
   *   If specified as `true` the language name will be shown in the info bar.
   * @property {boolean=} removeMargins
   *   If specified as `true` the margins for the main <pre> tag in the IFRAME
   *   will be removed.  Default is `false`.
   * @property {number=} resizeRate
   *   An integer indicating how often (in milliseconds) the IFRAME should be
   *   resized if necessary.  If not set will default to `100`.
   * @property {(boolean|string)=} showLanguage
   *   If specified as `true` the language name will be shown in the info bar.
   *   Otherwise if this is a string this string will appear in the info bar as
   *   the language.
   * @property {number=} tabSize
   *   How many spaces should be used to replace tab characters.
   * @property {string=} theme
   *   If specified this will be the Prism.js theme that will be used.  Any
   *   theme that is supported in version 1 should work.
   * @property {string=} templatePath
   *   If specified this will be the Prism.js template path which will be used
   *   to pull the supporting CSS and JS.  The default is
   *   `"https://cdn.jsdelivr.net/npm/prismjs@[[version]]/[[path]]"`.  The
   *   `version` template variable should be able to be represented as
   *   `"1.X.X"`.
   */

  /**
   * Creates an IFRAME which will display the prism syntax highlighted code.
   * @param {string|HTMLElement} code
   *   Either the code to show or the element whose text content indicates the
   *   code that should be shown.  In the case that this is an element it will be
   *   used as `opt_options.placeholder` and `opt_options.placement` will be
   *   `"replace"` unless defined as something else.
   * @param {string=} language
   *   The language of `code`.
   * @param {PrismizeOptions=} opt_options
   *   An optional object containing all of the options to be set.
   */

  function prismize(code, language, opt_options) {
    var _options$actions;

    var startingHeight = 0;
    var RGX_IS_HTML_BOOL = /^(false|no|off|0|true|yes|on|1|)$/i;
    var RGX_HTML_FALSE = /^(false|no|off|0)$/i;
    /** @type {PrismizeOptions} */

    var options = Object.assign({}, Object(opt_options));
    (_options$actions = options.actions) !== null && _options$actions !== void 0 ? _options$actions : options.actions = []; // If code is an element...

    if ('string' !== typeof code) {
      (function () {
        var _language, _options$id, _options$numberLines, _code$className, _options$className;

        // Get all options that are not already defined in the options object from
        // the data attributes.
        'copyable downloadName downloadable endWithInfoBar infoHTML infoText matchBraces maxHeight numberLines placement previewColors removeMargins resizeRate showLanguage tabSize templatePath theme'.split(' ').forEach(function (camelCaseProp) {
          var dataProp = 'data-' + camelCaseProp.replace(/[A-Z]+/g, '-$&').toLowerCase();

          if (!options.hasOwnProperty(camelCaseProp)) {
            if (code.hasAttribute(dataProp)) {
              options[camelCaseProp] = code.getAttribute(dataProp);
            } else if (DEFAULTS.hasOwnProperty(camelCaseProp)) {
              options[camelCaseProp] = DEFAULTS[camelCaseProp];
            }
          }
        }); // Handle special options.

        (_language = language) !== null && _language !== void 0 ? _language : language = code.getAttribute('data-prismize') || code.getAttribute('data-language');
        options.placeholder = code;
        (_options$id = options.id) !== null && _options$id !== void 0 ? _options$id : options.id = code.id; // Handle numbers.

        options.resizeRate = +options.resizeRate; // Handle the booleans.

        ['endWithInfoBar', 'matchBraces', 'previewColors', 'removeMargins'].forEach(function (propName) {
          var _options$propName;

          options[propName] = !RGX_HTML_FALSE.test((_options$propName = options[propName]) !== null && _options$propName !== void 0 ? _options$propName : '0');
        }); // Default the theme if not given.

        options.theme || (options.theme = 'default'); // If numberLines is defined as a number interpret it as such, otherwise
        // interpret it as a boolean.

        (_options$numberLines = options.numberLines) !== null && _options$numberLines !== void 0 ? _options$numberLines : options.numberLines = 'no';
        options.numberLines = RGX_IS_HTML_BOOL.test(options.numberLines) && options.numberLines != '0' ? !RGX_HTML_FALSE.test(options.numberLines) : +options.numberLines; // Correctly parse copyable, downloadable and showLanguage as either
        // booleans or strings.

        ['copyable', 'downloadable', 'showLanguage'].forEach(function (key) {
          var _options$key;

          (_options$key = options[key]) !== null && _options$key !== void 0 ? _options$key : options[key] = '0';

          if (RGX_IS_HTML_BOOL.test(options[key])) {
            options[key] = !RGX_HTML_FALSE.test(options[key]);
          }
        }); // Make sure to mark the original element as prismized.

        code.className = (_code$className = code.className) === null || _code$className === void 0 ? void 0 : _code$className.replace(/(?:^|\s)prismize(?:\s|$)/g, ' prismized '); // If className is to be pulled from the element go ahead and do so.

        (_options$className = options.className) !== null && _options$className !== void 0 ? _options$className : options.className = code.className; // Set the starting height.

        startingHeight = +options.maxHeight ? Math.min(code.clientHeight, +options.maxHeight) : code.clientHeight; // Get any custom buttons that should be shown and put them in
        // alphabetical order according to their action name (not their label).

        var newActions = [];

        var _loop = function _loop(i, attributes) {
          var _attributes$i = attributes[i],
              name = _attributes$i.name,
              value = _attributes$i.value;
          name.replace(/^data-action-(.+)$/, function (m, name) {
            newActions.push({
              id: name,
              name: name.replace(/-([^\-])/g, function (m, c) {
                return c.toUpperCase();
              }),
              label: value
            });
          });
        };

        for (var _code = code, attributes = _code.attributes, i = attributes.length; i--;) {
          _loop(i, attributes);
        }

        options.actions = newActions.sort(function (a, b) {
          return a.id < b.id ? -1 : 1;
        }).concat(options.actions); // Get the code as a string.

        code = Object.assign(document.createElement('pre'), {
          innerHTML: code.innerHTML.replace(/<br.*?>/g, '\n')
        }).textContent;
      })();
    } // Create the new IFRAME.


    var iframe = document.createElement('IFRAME');
    Object.assign(iframe.style, {
      height: startingHeight + 'px',
      width: options.width || '100%',
      border: 'none',
      display: 'block'
    }); // Assign the class name and the ID if them are given in options.

    if (options.className) iframe.className = options.className;
    if (options.id) iframe.id = options.id; // Get all of the Prism.js CSS files and the JS files.

    var _getPrismFilePaths = getPrismFilePaths(options),
        cssPaths = _getPrismFilePaths.cssPaths,
        jsPaths = _getPrismFilePaths.jsPaths; // Generate an ID that is unique to this prismized content.


    var IDENTIFIER = ('_' + Math.random() + Math.random()).replace(/\./g, '_'); // Gets the <pre> attributes as a string.

    var preClassNames = ["language-".concat(language)];
    if (options.numberLines) preClassNames.push('line-numbers');
    if (options.matchBraces) preClassNames.push('match-braces');
    var preAttributes = [["class", preClassNames.join(' ')], ["data-start", 'number' === typeof options.numberLines ? options.numberLines : 1]].reduce(function (htmls, pair) {
      return htmls + (pair[1] != undefined ? " ".concat(pair[0], "=\"").concat(htmlify(pair[1]), "\"") : '');
    }, ''); // Get the code that will be prismized as raw HTML.

    var escapedCode = Object.assign(document.createElement('div'), {
      innerText: unindentMin(code, {
        tabSize: +options.tabSize || undefined
      })
    }).innerHTML.replace(/<br.*?>/g, '\n'); // Get the stylesheets.

    var stylesheets = cssPaths.map(function (url) {
      return "<link rel=\"stylesheet\" href=\"".concat(url, "\" crossorigin=\"anonymous\" />");
    });
    var cssRules = 'body{margin:0;overflow:hidden;}' + '#wrapper{overflow:hidden;}' + "#infoBar{font-size:0.85em;color:#333;background-color:#EEE;border-radius:0.3em;overflow:hidden;box-shadow:0 0 1px 1px #000,0 ".concat(options.endWithInfoBar ? '-' : '', "0.4em 0.4em -0.2em;margin:").concat(options.endWithInfoBar ? '0.4em 2px 2px' : '2px 2px 0.4em', ";background-image:linear-gradient(to bottom,rgba(255,255,255,0.2),rgba(255,255,255,0.05) 50%,rgba(0,0,0,0.05) 50%,rgba(0,0,0,0.2));font-family:Tahoma;text-shadow:0.1em 0.1em 0.1em #fff;display:flex;user-select:none;}") + '#infoBar .content{flex:1;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;}' + '#infoBar>a,#infoBar .content{padding:0.4em 0.8em;}' + '#infoBar>a{text-decoration:none;box-shadow:0 0 1px #000;background-color:rgba(0,0,0,0.5);color:#FFF;text-shadow:0 0 1px #000;cursor:pointer;transition:0.25s ease all;}' + '#infoBar>a:hover{background-color:rgba(0,0,0,0.7);color:#FFF;}' + '#infoBar .success{background-color:rgba(0,127,0,0.7)!important;}' + '#infoBar .failure{background-color:rgba(127,0,0,0.7)!important;}' + '#infoBar .tag{filter:grayscale(1);display:inline-block;background-color:hsla(0,100%,50%,0.7);color:#FFF;text-shadow:0 0 0.1em #000;padding:0.2em 0.5em;box-shadow:0 0 1px #000,inset 0 0 0 1px #fff;margin:0 0.5em;font-size:0.85em;font-weight:bold;letter-spacing:0.05em;text-transform:uppercase;}' + '#infoBar :first-child{margin-left:0;}' + (options.removeMargins ? 'pre[class*=language-]{margin:0;}' : '') + (options.maxHeight != undefined ? 'pre[class*=language-]>code{overflow-y:auto;}' : '');
    stylesheets.splice(1, 0, "<style>".concat(cssRules, "</style>"));
    var infoBar = '';

    if (options.downloadable || options.copyable || options.infoText || options.infoHTML || options.showLanguage) {
      var _options$infoHTML, _options$infoText;

      var buttons = options.actions.map(function (action) {
        return Object.assign(action, {
          show: true
        });
      }).concat([{
        name: "copy",
        label: 'string' === typeof options.copyable ? options.copyable : 'Copy',
        show: options.copyable
      }, {
        name: "download",
        label: 'string' === typeof options.downloadable ? options.downloadable : 'Download',
        show: options.downloadable
      }]).reduce(function (buttons, _ref2) {
        var name = _ref2.name,
            label = _ref2.label,
            show = _ref2.show;

        if (show) {
          buttons += "<a href=\"javascript:;\" data-action=\"".concat(htmlify(name), "\">").concat(htmlify(label), "</a>");
        }

        return buttons;
      }, '');
      var content = (_options$infoHTML = options.infoHTML) !== null && _options$infoHTML !== void 0 ? _options$infoHTML : htmlify((_options$infoText = options.infoText) !== null && _options$infoText !== void 0 ? _options$infoText : '');
      var languageLabel = 'boolean' === typeof options.showLanguage ? language : options.showLanguage;
      var tag = options.showLanguage ? "<div class=\"language tag\" style=\"filter: grayscale(0) hue-rotate(".concat(valOfEngWord(languageLabel) * 360000, "deg);\">").concat(htmlify(languageLabel), "</div>") : '';
      infoBar = '<div id="infoBar">' + "<div class=\"content\">".concat(tag).concat(content, "</div>") + buttons + '</div>';
    } // Get the HTML code that will be pushed into the IFRAME.


    var html = '<base target="_parent" />' + stylesheets.join('') + '<div id="wrapper">' + (options.endWithInfoBar ? '' : infoBar) + "<pre".concat(preAttributes, "><code>").concat(escapedCode, "</code></pre>") + (options.endWithInfoBar ? infoBar : '') + '</div>' + '<script>(' + function () {
      // NOTE:  Reference window.document instead of just document to avoid
      //        errors when transpiling.
      var undefined = void 0;
      var _window = window,
          document = _window.document;
      var body = document.body;
      var fullHeight;
      var maxHeight;
      /** @type {PrismizeOptions} */

      var options = ":OPTIONS:";
      document.querySelectorAll('[data-action]').forEach(function (elem) {
        elem.addEventListener('click', function (e) {
          e.preventDefault();
          window.parent.postMessage({
            code: body.querySelector('pre').textContent,
            action: e.target.getAttribute('data-action'),
            id: ":IDENTIFIER:"
          }, '*');
        });
      });
      window.addEventListener('message', function (e) {
        var data = Object(e.data);

        if ('string' === typeof data.action && 'boolean' === typeof data.success) {
          document.querySelectorAll('[data-action]').forEach(function (anchor) {
            if (anchor.getAttribute('data-action') === data.action) {
              anchor.className += data.success ? ' success' : ' failure';
              setTimeout(function () {
                anchor.className = anchor.className.replace(/(^|\s+)(success|failure)(\s+|$)/, ' ').trim();
              }, 1000);
            }
          });
        }
      });
      setInterval(function () {
        // If maxHeight is defined see if the <code> tag's max height needs
        // to be updated.
        var wrapper = body.querySelector('#wrapper');
        var pre = body.querySelector('pre');
        var code = pre.querySelector('code');
        var verticalMargin = wrapper.offsetHeight - pre.offsetHeight;

        if (options.maxHeight != undefined) {
          var newMaxHeight = options.maxHeight - verticalMargin;

          if (maxHeight !== newMaxHeight) {
            maxHeight = newMaxHeight;
            code.style.maxHeight = newMaxHeight + 'px';
          }
        } // If the scroll height has changed send a message to the parent
        // window to resize this IFRAME.


        if (wrapper.offsetHeight !== fullHeight) {
          fullHeight = wrapper.offsetHeight;
          window.parent.postMessage({
            height: fullHeight,
            id: ":IDENTIFIER:"
          }, '*');
        }
      }, options.resizeRate || 100);
    }.toString().replace(/":IDENTIFIER:"/g, JSON.stringify(IDENTIFIER)).replace(/":OPTIONS:"/g, JSON.stringify(options)) + ')()</script>' + jsPaths.map(function (url) {
      return "<script src=\"".concat(url, "\" crossorigin=\"anonymous\"></script>");
    }).join(''); // Show the desired page in the IFRAME.


    iframe.src = 'data:text/html;charset=UTF-8,' + encodeURIComponent(html); // Whenever a message comes through check to see if it is from the prismize
    // IFRAME and if so resize the correct IFRAME accordingly.

    window.addEventListener('message', function (e) {
      if (e.source === iframe.contentWindow) {
        var data = Object(e.data);

        if (data.id === IDENTIFIER) {
          if ('number' === typeof data.height) {
            var height = data.height;

            if (options.maxHeight != undefined) {
              height = Math.min(height, +options.maxHeight);
            }

            iframe.style.height = "".concat(height, "px");
            options.onResize && options.onResize(iframe, opt_options);
          } else if (data.action) {
            var postBack = function postBack(success) {
              e.source.postMessage({
                action: data.action,
                success: !!success
              }, '*');
            };

            try {
              if (data.action === 'download') {
                Object.assign(document.createElement('a'), {
                  href: 'data:text/plain;charset=utf-8,' + encodeURIComponent(data.code),
                  download: options.downloadName || "".concat(language, " (").concat(new Date().toJSON(), ").txt")
                }).click();
              } else if (data.action === 'copy') {
                var innerPostBack = postBack;
                navigator.clipboard.writeText(data.code).then(function () {
                  return innerPostBack(true);
                })["catch"](function () {
                  return innerPostBack();
                });
                postBack = undefined;
              } else {
                if (options.onAction) {
                  options.onAction(data.action, data.code, iframe, options);
                }

                globalHandlers.forEach(function (globalHandler) {
                  return globalHandler(data.action, data.code, iframe, options);
                });
              }

              postBack && postBack(true);
            } catch (err) {
              postBack();
              console.error && console.error(err);
            }
          }
        }
      }
    }); // Correctly places the IFRAME according to placeholder and placement.

    var placement = options.placement || (options.placeholder ? 'replace' : 'end');
    var placeholder = options.placeholder || document.body;
    var parent = placement === "start" || placement === "end" ? placeholder : placeholder.parentNode;
    parent.insertBefore(iframe, placement === "start" ? placeholder.firstChild : placement === "after" ? placeholder.nextSibling : placement === "end" ? null : placeholder);

    if (placement === "replace") {
      parent.removeChild(placeholder);
    } // Call onLoad if it is defined.


    options.onLoad && options.onLoad(iframe, opt_options);
  }
  /**
   * Looks for all elements that either have the "data-prismize" attribute
   * defined or the "prismize" class and calls prismize on them once DOM content
   * is loaded.
   */


  function prismizeAll() {
    function onReady() {
      document.querySelectorAll('[data-prismize],.prismize').forEach(function (elem) {
        return prismize(elem);
      });
    }

    if (/^(complete|interactive)$/.test(document.readyState)) {
      onReady();
    } else {
      document.addEventListener("DOMContentLoaded", onReady);
    }
  }
  /**
   * Adds a handler which will listen for whenever a prismized code block's
   * custom action's button is clicked.
   * @param {(string: action, string: code, iframe: HTMLElement, options: PrismizeOptions) => void} handler
   *   Handler that will be called each time a custom action's button is
   *   clicked.
   */


  prismize.listenToActions = function (handler) {
    globalHandlers.push(handler);
  };
  /**
   * Takes a template string where each template variable is surrounded by two
   * sets of square brackets and returns the string with the values filled in.
   * @param {string} template 
   * @param {{[key: string]: any}} pairs 
   * @returns {string}
   */


  function fill(template, pairs) {
    var strRgx = '\\[\\[(' + Object.keys(pairs).reduce(function (arr, key) {
      return arr.concat(["".concat(key)]);
    }, []).join('|') + ')\\]\\]';
    return template.replace(new RegExp(strRgx, 'g'), function (_, key) {
      return pairs[key];
    });
  }
  /**
   * Finds the minimum indentation of all of the lines that have non-space
   * characters and removes the indentation accordingly for all indented lines.
   * @param {string} text
   *   The string containing the lines of text that should be unindented.
   * @param {{trim: boolean, tabSize: number}=} opt_options
   *   Optional, defaults to `{trim: true, tabSize: 4}`.  The `trim` property
   *   indicates if leading lines should be removed along with trailing
   *   whitespaces.  The `tabSize` property indicates how many spaces will be
   *   used to replace all tab characters.
   * @returns {string}
   *   A new version of `text` with all of the minimally indented lines having
   *   no leading spacing and all other indented lines following suit.  If
   *   `opt_options.trim` is `true` all leading lines and trailing spaces will
   *   not exist.  All tab characters will be replaced with
   *   `opt_options.tabSize` amount of space characters.
   */


  function unindentMin(text, opt_options) {
    var _opt_options$tabSize, _opt_options$trim;

    opt_options = Object(opt_options);
    var tabSize = (_opt_options$tabSize = opt_options.tabSize) !== null && _opt_options$tabSize !== void 0 ? _opt_options$tabSize : 4;
    var trim = (_opt_options$trim = opt_options.trim) !== null && _opt_options$trim !== void 0 ? _opt_options$trim : true;
    text = text.replace(/\t/g, ' '.repeat(tabSize));

    if (!/(^|[\r\n])\S/.test(text)) {
      var rgx = /(^|[\r\n])((?:(?!\r|\n)\s)+)(?=(\S)?)/g;
      var min = Infinity;

      for (var match; match = rgx.exec(text);) {
        if (match[3]) {
          min = Math.min(min, match[2].length);
        }
      }

      text = text.replace(rgx, function (_, start, spaces) {
        return start + spaces.slice(min);
      });
    }

    return trim ? text.replace(/^(\s*[\r\n]+)+|\s+$/g, '') : text;
  }
  /**
   * Takes a normal string and converts it so that any characters that need to
   * be encoded as HTML entities when interpreted as HTML will be returned.
   * @param {string} input 
   * @returns {string}
   */


  function htmlify(input) {
    return Object.assign(document.createElement('div'), {
      innerText: input
    }).innerHTML;
  }
  /**
   * Turns an english word into a number with a string full of A's being a 0 and
   * a string full of Z's being a 1.
   * @param {string} word 
   * @returns {number}
   */


  function valOfEngWord(word) {
    word = word.toUpperCase().replace(/([A-Z])|[^]/g, function (m, keep) {
      return keep ? (m.charCodeAt(0) - 65).toString(26) : '';
    });
    return parseInt(word, 26) / (Math.pow(26, word.length) - 1);
  }
  /**
   * Uses the options to get the correct Prism.js file paths.
   * @param {PrismizeOptions} options
   * @returns {{cssPaths: string[], jsPaths: string[]}}
   */


  function getPrismFilePaths(options) {
    var themePath = options.theme;

    if (/^[\w\-]*$/.test(themePath)) {
      themePath = themePath !== 'default' ? '-' + options.theme : '';
      themePath = fillPath("themes/prism".concat(themePath, ".min.css"));
    }

    function fillPath(path) {
      return fill(options.templatePath, {
        version: '1.X.X',
        path: path
      });
    }

    var cssPaths = [themePath];
    var jsPaths = [fillPath('prism.min.js'), fillPath('plugins/autoloader/prism-autoloader.min.js')];
    var base;

    if (options.numberLines) {
      base = 'plugins/line-numbers/prism-line-numbers.min.';
      cssPaths.push(fillPath(base + 'css'));
      jsPaths.push(fillPath(base + 'js'));
    }

    if (options.matchBraces) {
      base = 'plugins/match-braces/prism-match-braces.min.';
      cssPaths.push(fillPath(base + 'css'));
      jsPaths.push(fillPath(base + 'js'));
    }

    if (options.previewColors) {
      base = 'plugins/inline-color/prism-inline-color.min.';
      cssPaths.push(fillPath(base + 'css'));
      jsPaths.push(fillPath(base + 'js'), fillPath('components/prism-css-extras.min.js'));
    }

    return {
      cssPaths: cssPaths,
      jsPaths: jsPaths
    };
  } // Try to run prismizeAll() and then return prismize and prismizeAll() even if
  // primizeAll() fails.


  try {
    prismizeAll();
  } finally {
    return {
      prismize: prismize,
      prismizeAll: prismizeAll
    };
  }
}(window.document),
    prismize = _ref.prismize,
    prismizeAll = _ref.prismizeAll;