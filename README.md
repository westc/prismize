# Prismize

Easily use [Prism.js](https://prismjs.com/) on any web page.

## Usage

You must include prismize.js in your page and then a `<pre>` tag that contains an attribute named "data-prismize" and a value matching the language that you want to use for the syntax highlighting (eg. apex, css, javascript, etc.).  Here is a simple example:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Test Page</title>
    <script src="node_modules/prismize/prismize.js"></script>
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
