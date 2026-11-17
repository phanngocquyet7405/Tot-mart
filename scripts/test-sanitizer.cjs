const sanitize = require('sanitize-html');

const html = '<p class="tiptap-highlight bad-class" style="color: red"><img src="https://example.com/a.jpg" onerror="alert(1)" /><img src="javascript:alert(1)" /><a href="//evil.com" target="_blank">Link</a><a href="https://good.com" target="_blank">Good</a></p>';

const clean = sanitize(html, {
  allowedTags: sanitize.defaults.allowedTags.concat(['img', 'h1', 'h2', 'sub', 'sup']),
  allowedAttributes: {
    ...sanitize.defaults.allowedAttributes,
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    a: ['href', 'name', 'target', 'rel']
  },
  allowedClasses: {
    '*': ['tiptap-*']
  },
  allowedSchemesByTag: {
    img: ['http', 'https'],
    a: ['http', 'https', 'mailto', 'tel']
  },
  allowProtocolRelative: false,
  transformTags: {
    'a': (tagName, attribs) => {
      if (attribs.target === '_blank') {
        attribs.rel = 'noopener noreferrer';
      }
      return { tagName, attribs };
    }
  }
});

console.log('Cleaned HTML:');
console.log(clean);
