# Changelog

- **v1.1.0** (26 June 2022)
  - Updated `data-show-language` attribute and the `showLanguage` property (in prismize's URL or the `opt_options` object) to accept a non-boolean string which when specified will be used to indicate the label of the language for the code block.
  - Added `data-keep-margins` attribute and `keepMargins` property (in prismize's URL or the `opt_options` object) to keep the margins around the `<pre>` tag within the prismized content.
  - Added more content to [README.md](README.md) so that prismize is easier to use.
  - Added ability to specify a custom theme CSS file via the `data-theme` attribute or the `theme` property in prismize's URL or the `opt_options` object.
  - Added `data-language` attribute back since it could potentially be needed if the element is prismized because of the `prismize` class name instead of the `data-prismize` attribute.  (FIX)
  - Fixed the CSS rules so that margins before and after the main `<pre>` tag are not removed.

- **v1.0.1** (26 June 2022)
  - Changed from using `data-language` attribute to using `data-prismize` as indicated in [README.md](README.md).

- **v1.0.0** (26 June 2022)
  - Initial commit.