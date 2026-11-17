// Decap preview for the "Landing page" collection.
// Renders the real built page (fetched from "/") with the site's own CSS and fonts, then fills in the
// fields being edited (elements tagged data-cms / data-cms-img / data-cms-md / data-cms-list /
// data-cms-repeater in index.astro) and applies the Theme group using the shared presets in /theme-presets.json.
(function () {
  var DEFAULT_HEAD = 'redhat';
  var DEFAULT_BODY = 'redhat';
  var ready = Promise.all([
    fetch('/?cmspreview=' + Date.now()).then(function (r) { return r.text(); }),
    fetch('/theme-presets.json?v=' + Date.now()).then(function (r) { return r.json(); }),
  ]).then(function (res) {
    var doc = new DOMParser().parseFromString(res[0], 'text/html');
    doc.querySelectorAll('script').forEach(function (s) { s.remove(); });
    var styles = [].map.call(doc.querySelectorAll('link[rel="stylesheet"]'), function (l) { return l.getAttribute('href'); });
    return { body: doc.body.innerHTML, styles: styles, T: res[1] };
  });

  function bodyKey(T, t) {
    if (T.bodyFonts[t.body_font]) return t.body_font;
    var head = T.fonts[t.heading_font] ? t.heading_font : DEFAULT_HEAD;
    return (T.fonts[head] && T.fonts[head].body) || DEFAULT_BODY;
  }
  // Same logic as themeVars() in src/theme.ts.
  function themeVars(T, t) {
    t = t || {};
    var out = Object.assign({}, T.presets[t.preset] || {});
    Object.keys(T.roles).forEach(function (k) {
      if (t[k] && /^#[0-9a-f]{3,8}$/i.test(t[k])) Object.keys(T.roles[k]).forEach(function (v) { out[v] = T.roles[k][v].split('$').join(t[k]); });
    });
    var head = t.heading_font || DEFAULT_HEAD;
    if (head !== DEFAULT_HEAD && T.fonts[head]) out.head = "'" + T.fonts[head].family + "',system-ui,sans-serif";
    var bk = bodyKey(T, t);
    if (bk !== DEFAULT_BODY && T.bodyFonts[bk]) out.body = "'" + T.bodyFonts[bk].family + "',system-ui,sans-serif";
    if (t.button_shape && t.button_shape !== 'rounded' && T.buttons[t.button_shape]) out['btn-radius'] = T.buttons[t.button_shape];
    return out;
  }
  function get(o, path) { return String(path || '').split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function realUrl(u) {
    if (u == null) return '';
    var v = String(u).trim();
    if (!v || v === '#' || /^JOINIT_/.test(v)) return '';
    return v;
  }
  function applyLink(a, url) {
    var real = realUrl(url);
    var plain = a.parentElement && a.parentElement.querySelector(':scope > [data-plain-fallback]');
    if (real) {
      a.setAttribute('href', real);
      a.hidden = false;
      a.classList.remove('is-pending');
      if (/^https?:/i.test(real)) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
      else { a.removeAttribute('target'); a.removeAttribute('rel'); }
    } else {
      a.removeAttribute('href');
      a.hidden = true;
      a.classList.add('is-pending');
    }
    if (plain) plain.hidden = !!real;
  }
  function md(v) { return window.marked ? window.marked.parse(v || '') : (v || ''); }
  function enrollmentOn(v) { return v === true || v === 'true'; }
  function stripSignup(html, signup) {
    if (!signup) return html;
    var base = String(signup).replace(/\/$/, '');
    return String(html).replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, function (full, href, text) {
      var h = String(href).trim().replace(/\/$/, '');
      if (h === base || /^https?:\/\/app\.joinit\.com\/o\/home-wa$/i.test(h)) return text;
      return full;
    });
  }

  var Preview = createClass({
    componentDidMount: function () {
      var self = this, node = this.el, d = node.ownerDocument;
      ready.then(function (p) {
        self.p = p;
        p.styles.forEach(function (href) {
          if (!href || d.querySelector('link[data-home="' + href + '"]')) return;
          var l = d.createElement('link'); l.rel = 'stylesheet'; l.href = href; l.setAttribute('data-home', href); d.head.appendChild(l);
        });
        node.innerHTML = p.body;
        self.tpl = [];
        node.querySelectorAll('[data-cms-repeater], [data-cms-list]').forEach(function (el) {
          self.tpl.push([el, el.firstElementChild ? el.firstElementChild.cloneNode(true) : null]);
        });
        node.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a'); if (a && !/^#/.test(a.getAttribute('href') || '')) e.preventDefault(); });
        var btn = node.querySelector('.menubtn'), menu = node.querySelector('#mobile-menu');
        if (btn && menu) btn.addEventListener('click', function () { var o = btn.getAttribute('aria-expanded') !== 'true'; btn.setAttribute('aria-expanded', String(o)); menu.hidden = !o; });
        self.fill();
      });
    },
    componentDidUpdate: function () { this.fill(); },
    fill: function () {
      var p = this.p, node = this.el; if (!p) return;
      var props = this.props, data = props.entry.getIn(['data']).toJS(), d = node.ownerDocument;
      var open = enrollmentOn(data.enrollmentOpen);
      function renderMd(v) {
        var html = md(v);
        return open ? html : stripSignup(html, realUrl(data.join_url));
      }
      node.querySelectorAll('[data-cms]').forEach(function (el) {
        var v = get(data, el.getAttribute('data-cms'));
        el.textContent = v == null ? '' : v;
      });
      node.querySelectorAll('[data-cms-md]').forEach(function (el) {
        el.innerHTML = renderMd(data[el.getAttribute('data-cms-md')] || '');
      });
      node.querySelectorAll('[data-cms-img]').forEach(function (el) {
        var key = el.getAttribute('data-cms-img');
        var v = data[key];
        var slot = el.closest('[data-cms-slot]');
        if (v) {
          var a = props.getAsset(v);
          el.src = a ? a.toString() : v;
          if (slot) slot.hidden = false;
        } else {
          el.removeAttribute('src');
          if (slot) slot.hidden = true;
        }
        var altKey = el.getAttribute('data-cms-alt');
        el.alt = (altKey && data[altKey]) || '';
      });
      (this.tpl || []).forEach(function (pair) {
        var el = pair[0], tpl = pair[1];
        if (!tpl) return;
        var key = el.getAttribute('data-cms-repeater') || el.getAttribute('data-cms-list');
        var items = data[key] || [];
        el.innerHTML = '';
        items.forEach(function (item) {
          var n = tpl.cloneNode(true);
          if (item == null || typeof item !== 'object') {
            var text = item == null ? '' : String(item);
            var s = n.querySelector('span');
            (s || n).textContent = text;
          } else {
            n.querySelectorAll('[data-field]').forEach(function (f) {
              var val = item[f.getAttribute('data-field')];
              f.textContent = val == null ? '' : val;
            });
            n.querySelectorAll('[data-field-md]').forEach(function (f) {
              f.innerHTML = renderMd(item[f.getAttribute('data-field-md')] || '');
            });
            n.querySelectorAll('[data-field-href]').forEach(function (a) {
              applyLink(a, item[a.getAttribute('data-field-href')]);
            });
            n.querySelectorAll('[data-field-mailto]').forEach(function (a) {
              var email = item[a.getAttribute('data-field-mailto')] || '';
              if (email) { a.setAttribute('href', 'mailto:' + email); a.hidden = false; }
              else { a.removeAttribute('href'); a.hidden = true; }
            });
            n.querySelectorAll('[data-field-hide-empty]').forEach(function (f) {
              f.hidden = !item[f.getAttribute('data-field-hide-empty')];
            });
          }
          el.appendChild(n);
        });
        if (el.classList.contains('faq-list')) {
          el.querySelectorAll(':scope > details.faq').forEach(function (d, i) {
            if (i === 0) d.setAttribute('open', '');
            else d.removeAttribute('open');
          });
        }
        var step = 0;
        el.querySelectorAll(':scope > li.doc-item').forEach(function (li) {
          var link = li.querySelector('a.doc-row');
          var num = li.querySelector('.doc-num');
          var hasLink = !!(link && !link.hidden && link.getAttribute('href'));
          if (num) num.textContent = hasLink ? String(++step) : '';
        });
      });
      node.querySelectorAll('[data-cms-mailto]').forEach(function (a) {
        var email = get(data, a.getAttribute('data-cms-mailto')) || '';
        if (email) a.setAttribute('href', 'mailto:' + email);
      });
      node.querySelectorAll('[data-cms-href]').forEach(function (a) {
        a.setAttribute('href', realUrl(get(data, a.getAttribute('data-cms-href'))) || '#');
      });
      node.querySelectorAll('[data-cms-optional-href]').forEach(function (a) {
        applyLink(a, get(data, a.getAttribute('data-cms-optional-href')));
      });
      node.querySelectorAll('[data-enrollment-note]').forEach(function (el) {
        el.hidden = open || !String(el.textContent || '').trim();
      });
      var signup = realUrl(data.join_url) || '#';
      node.querySelectorAll('[data-join-cta]').forEach(function (el) {
        var openHtml = el.getAttribute('data-open-html') || 'Become a Member';
        var cls = el.className.replace(/\bis-closed\b/g, '').replace(/\s+/g, ' ').trim();
        var next = d.createElement(open ? 'a' : 'span');
        next.className = open ? cls : cls + ' is-closed';
        next.setAttribute('data-join-cta', '');
        next.setAttribute('data-open-html', openHtml);
        if (open) {
          next.setAttribute('href', signup);
          next.setAttribute('data-cms-href', 'join_url');
          next.innerHTML = openHtml;
        } else {
          next.setAttribute('aria-disabled', 'true');
          next.textContent = 'Enrollment closed';
        }
        el.replaceWith(next);
      });
      var root = d.documentElement, t = data.theme || {}, vars = themeVars(p.T, t);
      (this.set || []).forEach(function (k) { root.style.removeProperty('--' + k); });
      this.set = Object.keys(vars);
      Object.keys(vars).forEach(function (k) { root.style.setProperty('--' + k, vars[k]); });
      var bk = bodyKey(p.T, t);
      [[p.T.fonts[t.heading_font || DEFAULT_HEAD], 'h-' + (t.heading_font || DEFAULT_HEAD)], [p.T.bodyFonts[bk], 'b-' + bk]].forEach(function (x) {
        if (!x[0] || d.querySelector('link[data-font="' + x[1] + '"]')) return;
        var l = d.createElement('link'); l.rel = 'stylesheet'; l.setAttribute('data-font', x[1]);
        l.href = 'https://fonts.googleapis.com/css2?family=' + x[0].css + '&display=swap'; d.head.appendChild(l);
      });
    },
    render: function () { var self = this; return h('div', { ref: function (el) { self.el = el; }, className: 'home-preview' }); },
  });
  CMS.registerPreviewTemplate('landing', Preview);
})();
