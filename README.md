# Prismize

Easily use [Prism.js](https://prismjs.com/) on any web page.

## Changelog

All of the changes from version to version can be found [here](CHANGELOG.md).

## Usage

You must include prismize.js in your page and then a `<pre>` tag that contains an attribute named "data-prismize" and a value matching the language that you want to use for the syntax highlighting (eg. apex, css, javascript, etc.).  Here is a simple example:

```html
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/prismize/prismize.min.js"></script>
  </head>
  <body>
    <pre data-prismize="apex">
      System.debug(JSON.serializePretty(new Map&lt;String,Object> {
        'first' => 'John',
        'age' => 23
      }));
    </pre>
  </body>
</html>
```

## Default Options

Default options can be set by including them as URL parameters in the `<script>` tag:

```html
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/prismize/prismize.min.js?copyable"></script>
  </head>
  <body>
    <pre data-prismize="javascript">
      const adjective = "crazy";
      console.log(`Hello ${adjective} world!`);
    </pre>
  </body>
</html>
```

## Attribute Options

Options for specific prismized content can be set by including the correct `data-*` attributes in the `<pre>` tag.  The following are all of the supported `data-*` attributes that you can use:

Attribute | Type | Description
--|--|--
`data-action-*` | String | Specify an attribute starting with `data-action-` to add an additional button to the toolbar.  These buttons will be ordered by the name of the attributes, not the labels.  All custom action buttons will appear before the `Copy` and `Download` buttons.
`data-copyable` | Boolean \| String | If this is a boolean value it indicates whether or not to show a copy to clipboard button in a info bar in the top-right corner of the code block.  If this is a string the code block will appear with a copy to clipboard button in the info bar in the top-right with this string as the button's label.
`data-downloadable` | Boolean \| String | If this is a boolean value it indicates whether or not to show a download button in a info bar in the top-right corner of the code block.  If this is a string the code block will appear with a download button in the info bar in the top-right with this string as the button's label.
`data-downloadable` | String | The file name for the file that will be downloaded.
`data-info-text` | String | Used to show specific text after the language tag but before the buttons in the info bar.
`data-info-html` | String | Used to evaluate HTML that will appear after the language tag but before the buttons in the info bar.
`data-language` | String | Alternative to `data-language`.  Used to indicate the language to be used to highlight the syntax.
`data-match-braces` | Boolean | Indicates whether to use the [match-braces plugin](https://prismjs.com/plugins/match-braces/).
`data-max-height` | Integer | Indicates the maximum height of the containing element (IFRAME) of the syntax highlighted code.
`data-number-lines` | Boolean \| Integer | If this is a boolean value it indicates whether or not to number the lines.  If this is an integer the code block will appear with numbered lines starting with the specified number.
`data-placement` | String | Indicates where to place the prismized syntax highlighted block.  Defaults to `"replace"`.  Valid values are as follows:<ul><li>`"start"` - Inserts as the first element of this `<pre>` tag.</li><li>`"end"` - Inserts as the last element of this `<pre>` tag.</li><li>`"before"` - Inserts as an element directly before this `<pre>` tag.</li><li>`"after"` - Inserts as an element directly after this `<pre>` tag.</li><li>`"replace"` - Replaces this `<pre>` tag.</li></ul>
`data-preview-colors` | Boolean | Indicates whether to use the [inline-color plugin](https://prismjs.com/plugins/inline-color/).
`data-prismize` | String | Used to indicate the language to be used to highlight the syntax.
`data-remove-margins` | Boolean | Indicates whether or not to remove the margins that are ordinarily found before and/or after the main `<pre>` tag within the prismized content.
`data-resize-rate` | Integer | Indicates how often (in milliseconds) to try to resize the containing element (IFRAME) based on the rendered syntax highlighted code's height.
`data-show-language` | Boolean \| String | If this is a boolean it indicates whether to use the [show-language plugin](https://prismjs.com/plugins/show-language/).  If this is a string the [show-language plugin](https://prismjs.com/plugins/show-language/) will be used and the specified string will display as the language for this code block.
`data-tab-size` | Integer | Indicates how many spaces a tab character should resolve to.
`data-template-path` | String | Indicates where to pull all of the Prism.js files from.  This supports a form of template variables which must be surrounded with 2 sets of square brackets (eg. `[[version]]`).  This defaults to `"https://cdn.jsdelivr.net/npm/prismjs@[[version]]/[[path]]"`.  The following are valid template variables:<ul><li>`[[path]]` - This will be replaced with the relative path of the files that are needed (eg. theme files, plugin files).</li><li>`[[version]]` - This will be replaced with `"1.X.X"`.</li>
`data-theme` | String | Indicates the Prism.js theme that should be used for the syntax highlighted code.  You can either supply a path to a CSS theme (you can find more themes [here](https://github.com/PrismJS/prism-themes)) or you can use one of the following valid theme names:<ul><li>`"default"`</li><li>`"coy"`</li><li>`"dark"`</li><li>`"funky"`</li><li>`"okaidia"`</li><li>`"solarizedlight"`</li><li>`"tomorrow"`</li><li>`"twilight"`</li></ul>

## Invoking Via JavaScript

Three functions are added to the global scope:

- `prismize()` - Can be used on a single block of code or a string which contains code.
- `prismize.listenToActions()` - Called to listen to actions for all prismized code.
- `prismizeAll()` - Called to execute `prismize()` on all elements on the page that either have a `data-prismize` attribute or a `prismize` class name.

These functions are documented with JSDoc syntax which will help you understand how to use them.
