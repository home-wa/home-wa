// Decap preview for the "Landing page" collection.
// Renders the real built page (fetched from "/") with the site's own CSS and fonts, then fills in the
// fields being edited (elements tagged data-cms / data-cms-img / data-cms-md / data-cms-list in index.astro)
// and applies the Theme group using the shared presets in /theme-presets.json.
(function () {
  var ready = Promise.all([
    fetch('/?cmspreview=' + Date.now()).then(function (r) { return r.text(); }),
    fetch('/theme-presets.json?v=' + Date.now()).then(function (r) { return r.json(); }),
  ]).then(function (res) {
    var doc = new DOMParser().parseFromString(res[0], 'text/html');
    doc.querySelectorAll('script').forEach(function (s) { s.remove(); });
    var styles = [].map.call(doc.querySelectorAll('link[rel="stylesheet"]'), function (l) { return l.getAttribute('href'); });
    return { body: doc.body.innerHTML, styles: styles, T: res[1] };
  });

  // Same logic as themeVars() in src/theme.ts.
  function themeVars(T, t) {
    t = t || {};
    var out = Object.assign({}, T.presets[t.preset] || {});
    Object.keys(T.roles).forEach(function (k) {
      if (t[k] && /^#[0-9a-f]{3,8}$/i.test(t[k])) Object.keys(T.roles[k]).forEach(function (v) { out[v] = T.roles[k][v].split('$').join(t[k]); });
    });
    if (t.heading_font && t.heading_font !== 'nunito' && T.fonts[t.heading_font]) out.head = "'" + T.fonts[t.heading_font].family + "',system-ui,sans-serif";
    return out;
  }
  function get(o, path) { return path.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function link(u) { return !u || /^JOINIT_/.test(u) ? '#' : u; }

  var Preview = createClass({
    componentDidMount: function () {
      var self = this, node = this.el, d = node.ownerDocument;
      ready.then(function (p) {
        self.p = p;
        p.styles.forEach(function (href) {
          if (!d.querySelector('link[data-home="' + href + '"]')) { var l = d.createElement('link'); l.rel = 'stylesheet'; l.href = href; l.setAttribute('data-home', href); d.head.appendChild(l); }
        });
        node.innerHTML = p.body;
        var ul = node.querySelector('[data-cms-list]');
        self.li = ul && ul.firstElementChild && ul.firstElementChild.cloneNode(true);
        node.addEventListener('click', function (e) { var a = e.target.closest('a'); if (a && !/^#/.test(a.getAttribute('href') || '')) e.preventDefault(); });
        var btn = node.querySelector('.menubtn'), menu = node.querySelector('#mobile-menu');
        if (btn && menu) btn.addEventListener('click', function () { var o = btn.getAttribute('aria-expanded') !== 'true'; btn.setAttribute('aria-expanded', String(o)); menu.hidden = !o; });
        self.fill();
      });
    },
    componentDidUpdate: function () { this.fill(); },
    fill: function () {
      var p = this.p, node = this.el; if (!p) return;
      var props = this.props, data = props.entry.getIn(['data']).toJS(), d = node.ownerDocument;
      node.querySelectorAll('[data-cms]').forEach(function (el) { var v = get(data, el.getAttribute('data-cms')); el.textContent = v == null ? '' : v; });
      node.querySelectorAll('[data-cms-img]').forEach(function (el) {
        var v = data[el.getAttribute('data-cms-img')]; if (v) { var a = props.getAsset(v); el.src = a ? a.toString() : v; }
        el.alt = data[el.getAttribute('data-cms-alt')] || '';
      });
      node.querySelectorAll('[data-cms-md]').forEach(function (el) {
        var v = data[el.getAttribute('data-cms-md')] || ''; el.innerHTML = window.marked ? window.marked.parse(v) : v;
      });
      var li = this.li;
      node.querySelectorAll('[data-cms-list]').forEach(function (ul) {
        if (!li) return; ul.innerHTML = '';
        (data[ul.getAttribute('data-cms-list')] || []).forEach(function (t) { var n = li.cloneNode(true); n.querySelector('span').textContent = t; ul.appendChild(n); });
      });
      if (data.contact_email) node.querySelectorAll('a[href^="mailto:"]').forEach(function (a) { a.setAttribute('href', 'mailto:' + data.contact_email); });
      // Theme: CSS variables on the preview's <html>, plus the heading font stylesheet.
      var root = d.documentElement, t = data.theme || {}, vars = themeVars(p.T, t);
      (this.set || []).forEach(function (k) { root.style.removeProperty('--' + k); });
      this.set = Object.keys(vars);
      Object.keys(vars).forEach(function (k) { root.style.setProperty('--' + k, vars[k]); });
      var f = p.T.fonts[t.heading_font];
      if (f && !d.querySelector('link[data-font="' + t.heading_font + '"]')) {
        var l = d.createElement('link'); l.rel = 'stylesheet'; l.setAttribute('data-font', t.heading_font);
        l.href = 'https://fonts.googleapis.com/css2?family=' + f.css + '&display=swap'; d.head.appendChild(l);
      }
    },
    render: function () { var self = this; return h('div', { ref: function (el) { self.el = el; }, className: 'home-preview' }); },
  });
  CMS.registerPreviewTemplate('landing', Preview);
})();
