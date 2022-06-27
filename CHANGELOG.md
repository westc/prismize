# Changelog

- **v1.1.0** (27 June 2022)
  - Updated `data-show-language` attribute and the `showLanguage` property (in prismize's URL or the `opt_options` object) to accept a non-boolean string which when specified will be used to indicate the label of the language for the code block.
  - Added `data-downloadable` attribute and `downloadable` property (in prismize's URL or the `opt_options` object) to add a download button.
  - Added `data-download-name` attribute and `downloadName` property (in prismize's URL or the `opt_options` object) to be able to customize the file name for the file downloaded when clicking on the download button.
  - Added `data-remove-margins` attribute and `removeMargins` property (in prismize's URL or the `opt_options` object) to remove the margins around the `<pre>` tag within the prismized content.
  - Added more content to [README.md](README.md) so that prismize is easier to use.
  - Added ability to specify a custom theme CSS file via the `data-theme` attribute or the `theme` property in prismize's URL or the `opt_options` object.
  - Added `data-language` attribute back since it could potentially be needed if the element is prismized because of the `prismize` class name instead of the `data-prismize` attribute.  (FIX)
  - Fixed the max height option so that although this applies to the maximum height of the IFRAME it will add a scrollbar to the Prism `<code>` tag instead of the whole IFRAME window.
  - Fixed the CSS rules so that margins before and after the main `<pre>` tag are not removed.

- **v1.0.1** (26 June 2022)
  - Changed from using `data-language` attribute to using `data-prismize` as indicated in [README.md](README.md).

- **v1.0.0** (26 June 2022)
  - Initial commit.