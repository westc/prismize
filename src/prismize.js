/**
 * @preserve Copyright 2022 - Chris West - MIT Licensed
 * 
 * When this code is first executed it will call `prismizeAll()`.  The order of
 * precedence for the options is (1) the `opt_options` passed in to
 * `prismize()`, (2) the corresponding data attributes on any `code` element
 * passed to `prismize()`, and (3) the corresponding camel cased options as
 * defined in the URL of the script tag that defines and executes this code.
 */

const {prismize, prismizeAll} = (function(document, undefined) {
  /** @type {PrismizeOptions} */
  const DEFAULTS = Array.from(
    (document.currentScript.src || '')
      .replace(/\+/g, ' ')
      .matchAll(/[?&]([^=&#]+)(?:=([^&#]*))?/g)
  ).reduce(
    (DEFAULTS, [_, k, v]) => Object.assign(
      DEFAULTS,
      { [decodeURIComponent(k)]: v ? decodeURIComponent(v) : '' }
    ),
    {}
  );
  DEFAULTS.templatePath = 'https://cdn.jsdelivr.net/npm/prismjs@[[version]]/[[path]]';

  /**
   * Takes a template string where each template variable is surrounded by two
   * sets of square brackets and returns the string with the values filled in.
   * @param {string} template 
   * @param {{[key: string]: any}} pairs 
   * @returns {string}
   */
  function fill(template, pairs) {
    const strRgx = '\\[\\[('
      + Object.keys(pairs).reduce(
          (arr, key) => arr.concat([`${key}`]),
          []
        ).join('|')
      + ')\\]\\]';
    return template.replace(new RegExp(strRgx, 'g'), (_, key) => pairs[key]);
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
    opt_options = Object(opt_options);
    const tabSize = opt_options.tabSize ?? 4;
    const trim = opt_options.trim ?? true;
    text = text.replace(/\t/g, ' '.repeat(tabSize));
    if (!/(^|[\r\n])\S/.test(text)) {
      const rgx = /(^|[\r\n])((?:(?!\r|\n)\s)+)(?=(\S)?)/g;
      let min = Infinity;
      for (let match; match = rgx.exec(text);) {
        if (match[3]) {
          min = Math.min(min, match[2].length);
        }
      }
      text = text.replace(
        rgx,
        (_, start, spaces) => start + spaces.slice(min)
      );
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
    return Object.assign(document.createElement('div'), {innerText: input}).innerHTML;
  }

  /**
   * @typedef {Object} PrismizeOptions
   * @property {(boolean|number)=} numberLines
   *   If specified as `true` or a number the lines will be numbered.  If
   *   specified as a number that will be used as the first line number to show.
   * @property {boolean=} matchBraces
   *   If specified as `true` the match braces plugin will be enabled.
   * @property {boolean=} showLanguage
   *   If specified as `true` the language name will be shown in the toolbar.
   * @property {boolean=} previewColors
   *   If specified as `true` the language name will be shown in the toolbar.
   * @property {(boolean|string)=} copyable
   *   If specified as `true` the code will have a copy to clipboard button in the
   *   toolbar.  If specified as a string this will be the button text that will
   *   show in the toolbar.
   * @property {string=} theme
   *   If specified this will be the Prism.js theme that will be used.  Any
   *   theme that is supported in version 1 should work.
   * @property {string=} templatePath
   *   If specified this will be the Prism.js template path which will be used
   *   to pull the supporting CSS and JS.  The default is
   *   `"https://cdn.jsdelivr.net/npm/prismjs@[[version]]/[[path]]"`.  The
   *   `version` template variable should be able to be represented as
   *   `"1.X.X"`.
   * @property {HTMLElement=} placeholder
   *   Element around where the IFRAME should be placed.  Defaults to
   *   `document.body`.
   * @property {("before"|"after"|"replace"|"end"|"start")=} placement
   *   Where to place the IFRAME in relation to `placeholder`.  Defaults to
   *   `"replace"` if `placeholder` is given, otherwise defaults to `"end"`.
   * @property {number=} maxHeight
   *   Maximum height of the content.
   * @property {number=} tabSize
   *   How many spaces should be used to replace tab characters.
   * @property {string=} id
   *   The ID to assign to the IFRAME.
   * @property {string=} className
   *   Class name to assign to the IFRAME.
   * @property {number=} resizeRate
   *   An integer indicating how often (in milliseconds) the IFRAME should be
   *   resized if necessary.  If not set will default to `100`.
   * @property {((iframe: HTMLElement, options: PrismizeOptions) => void)=} onLoad
   *   If specified this function will be called after the IFRAME is added to
   *   the DOM.
   * @property {((iframe: HTMLElement, options: PrismizeOptions) => void)=} onResize
   *   If specified this function will be called whenever the contents of the
   *   IFRAME have been resized.
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
    let startingHeight = 0;

    const RGX_IS_HTML_BOOL = /^(false|no|off|0|true|yes|on|1|)$/i;
    const RGX_HTML_FALSE = /^(false|no|off|0)$/i;

    /** @type {PrismizeOptions} */
    const options = Object.assign({}, Object(opt_options));

    // If code is an element...
    if ('string' !== typeof code) {
      // Get all options that are not already defined in the options object from
      // the data attributes.
      'matchBraces showLanguage previewColors placement resizeRate maxHeight tabSize theme numberLines copyable templatePath'
        .replace(/\w+/g, function(camelCaseProp) {
          const dataProp = 'data-' + camelCaseProp.replace(/[A-Z]/g, '-$&').toLowerCase();
          if (!options.hasOwnProperty(camelCaseProp)) {
            if (code.hasAttribute(dataProp)) {
              options[camelCaseProp] = code.getAttribute(dataProp);
            }
            else if (DEFAULTS.hasOwnProperty(camelCaseProp)) {
              options[camelCaseProp] = DEFAULTS[camelCaseProp];
            }
          }
        });
      
      // Handle special options.
      language ??= code.getAttribute('data-prismize');
      options.placeholder = code;
      options.placement ??= code.getAttribute('data-placement');
      options.id ??= code.id;
      
      // Handle the booleans.
      options.matchBraces = !RGX_HTML_FALSE.test(options.matchBraces ?? '0');
      options.showLanguage = !RGX_HTML_FALSE.test(options.showLanguage ?? '0');
      options.previewColors = !RGX_HTML_FALSE.test(options.previewColors ?? '0');

      // Default the theme if not given.
      options.theme ||= 'default';
      
      // If numberLines is defined as a number interpret it as such, otherwise
      // interpret it as a boolean.
      options.numberLines ??= 'no';
      options.numberLines = (RGX_IS_HTML_BOOL.test(options.numberLines) && options.numberLines != '0')
        ? !RGX_HTML_FALSE.test(options.numberLines)
        : +options.numberLines;

      // If copyable is defined as a non-boolean string keep it as is otherwise
      // convert it to a real boolean.
      options.copyable ??= '0';
      if (RGX_IS_HTML_BOOL.test(options.copyable)) {
        options.copyable = !RGX_HTML_FALSE.test(options.copyable);
      }
        
      // Make sure to mark the original element as prismized.
      code.className = code.className?.replace(/(?:^|\s)prismize(?:\s|$)/g, ' prismized ');

      // If className is to be pulled from the element make sure to turn
      // "prismize" into "prismized".
      options.className ??= code.className;

      // Set the starting height.
      startingHeight = +options.maxHeight
        ? Math.min(code.clientHeight, +options.maxHeight)
        : code.clientHeight;

      // Get the code as a string.
      code = Object.assign(document.createElement('pre'), {
        innerHTML: code.innerHTML.replace(/<br.*?>/g, '\n')
      }).textContent;
    }

    // Create the new IFRAME.
    let iframe = document.createElement('IFRAME');
    Object.assign(iframe.style, {
      height: startingHeight + 'px',
      width: options.width || '100%',
      border: 'none',
      display: 'block'
    });

    // Assign the class name and the ID if them are given in options.
    if (options.className) iframe.className = options.className;
    if (options.id) iframe.id = options.id;

    let needsToolbar;
    const themeSuffix = options.theme !== 'default' ? '-' + options.theme : '';
    
    function fillPath(path) {
      return fill(options.templatePath, {version: '1.X.X', path});
    }

    const cssFiles = [fillPath(`themes/prism${themeSuffix}.min.css`)];
    const jsFiles = [
      fillPath('prism.min.js'),
      fillPath('plugins/autoloader/prism-autoloader.min.js')
    ];

    let base;

    if (options.numberLines) {
      base = 'plugins/line-numbers/prism-line-numbers.min.';
      cssFiles.push(fillPath(base + 'css'));
      jsFiles.push(fillPath(base + 'js'));
    }

    if (options.matchBraces) {
      base = 'plugins/match-braces/prism-match-braces.min.';
      cssFiles.push(fillPath(base + 'css'));
      jsFiles.push(fillPath(base + 'js'));
    }

    if (options.previewColors) {
      base = 'plugins/inline-color/prism-inline-color.min.';
      cssFiles.push(fillPath(base + 'css'));
      jsFiles.push(
        fillPath(base + 'js'),
        fillPath('components/prism-css-extras.min.js')
      );
    }
    
    if (options.copyable) {
      jsFiles.push(fillPath('plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js'));
      needsToolbar = true;
    }
    
    if (options.showLanguage) {
      jsFiles.push(fillPath('plugins/show-language/prism-show-language.min.js'));
      needsToolbar = true;
    }
    
    if (needsToolbar) {
      base = 'plugins/toolbar/prism-toolbar.min.';
      cssFiles.splice(1, 0, fillPath(base + 'css'));
      jsFiles.splice(1, 0, fillPath(base + 'js'));
    }

    // Generate an ID that is unique to this prismized content.
    const IDENTIFIER = ('_' + Math.random() + Math.random()).replace(/\./g, '_');

    // Get the HTML code that will be pushed into the IFRAME.
    const divCode = document.createElement('div');
    divCode.innerText = unindentMin(code, {tabSize: +options.tabSize || undefined});
    let escapedCode = divCode.innerHTML.replace(/<br.*?>/g, '\n');
    let firstLineNumber = 'number' === typeof options.numberLines ? options.numberLines : 1;
    let copyButtonTextHTML = options.copyable === true ? "Copy" : htmlify(options.copyable);
    let preClassNames = [`language-${language}`];
    if (options.numberLines) preClassNames.push('line-numbers');
    if (options.matchBraces) preClassNames.push('match-braces');
    let html = '<base target="_parent" />'
      + cssFiles.map(url => `<link rel="stylesheet" href="${url}" crossorigin="anonymous" />`).join('')
      + '<style>body,body>*:first-child{margin:0}</style>'
      + `<pre class="${preClassNames.join(' ')}" data-prismjs-copy="${copyButtonTextHTML}" data-start="${firstLineNumber}"><code>${escapedCode}</code></pre>`
      + '<script>('
      + (function() {
          // NOTE:  Reference window.document instead of just document to avoid
          //        errors when transpiling.
          let { body } = window.document;
          let height = body.clientHeight;
          setInterval(() => {
            let pre = body.querySelector('pre');
            let newHeight = parseInt(getComputedStyle(pre).marginTop)
              + pre.offsetHeight
              + parseInt(getComputedStyle(pre).marginBottom);
            if (height !== newHeight) {
              height = newHeight;
              window.parent.postMessage({height: newHeight, id: ":IDENTIFIER:"}, '*');
            }
          }, ":RATE:");
        }).toString()
          .replace('":IDENTIFIER:"', JSON.stringify(IDENTIFIER))
          .replace('":RATE:"', options.autoResize != false ? options.resizeRate || 100 : Infinity)
      + ")()</script>"
      + jsFiles.map(url => `<script src="${url}" crossorigin="anonymous"></script>`).join('');

    // Show the desired page in the IFRAME.
    iframe.src = 'data:text/html;charset=UTF-8,' + encodeURIComponent(html);

    // Whenever a message comes through check to see if it is from the prismize
    // IFRAME and if so resize the correct IFRAME accordingly.
    window.addEventListener('message', e => {
      if (e.source === iframe.contentWindow) {
        let data = Object(e.data);
        if ('number' === typeof data.height && data.id === IDENTIFIER) {
          let {height} = data;
          if (options.maxHeight != undefined) {
            height = Math.min(height, +options.maxHeight);
          }
          iframe.style.height = `${height}px`;
          options.onResize && options.onResize(iframe, opt_options);
        }
      }
    });
    
    // Correctly places the IFRAME according to placeholder and placement.
    let placement = options.placement || (options.placeholder ? 'replace' : 'end');
    let placeholder = options.placeholder || document.body;
    let parent = placement === "start" || placement === "end" ? placeholder : placeholder.parentNode;
    parent.insertBefore(
      iframe,
      placement === "start"
        ? placeholder.firstChild
        : placement === "after"
          ? placeholder.nextSibling
          : placement === "end"
            ? null
            : placeholder
    );
    if (placement === "replace") {
      parent.removeChild(placeholder);
    }

    // Call onLoad if it is defined.
    options.onLoad && options.onLoad(iframe, opt_options);
  }

  /**
   * Looks for all elements that either have the "data-prismize" attribute
   * defined or the "prismize" class and calls prismize on them once DOM content
   * is loaded.
   */
  function prismizeAll() {
    function onReady() {
      document.querySelectorAll('[data-prismize],.prismize').forEach(elem => prismize(elem));
    }

    if (/^(complete|interactive)$/.test(document.readyState)) {
      onReady();
    }
    else {
      document.addEventListener("DOMContentLoaded", onReady);
    }
  }

  try {
    prismizeAll();
  }
  finally {
    return {prismize, prismizeAll};
  }
})(window.document);
