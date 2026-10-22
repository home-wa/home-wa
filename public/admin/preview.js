/* Decap CMS preview templates: render each section like the real page. */
(function () {
  var CMS = window.CMS, h = window.h, createClass = window.createClass;
  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&family=Source+Sans+3:wght@400;600&display=swap');
  CMS.registerPreviewStyle('/admin/preview.css');
  // Preview-only tweaks: keep the logo small, no sticky effects.
  CMS.registerPreviewStyle('body{margin:0} .logo img,.f-logo{height:44px!important;width:auto!important;max-width:200px} .pv-note{font:14px/1.4 system-ui;color:#5B6270;background:#F5F7FB;border-bottom:1px solid #E3E7EF;padding:8px 16px;margin:0} .pv-hidden{opacity:.35}', { raw: true });

  var ICONS = {
    parents: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    kids: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
    teens: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', chevron: '<path d="m6 9 6 6 6-6"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>'
  };
  function icon(n, size, cls) {
    return h('span', { className: cls, dangerouslySetInnerHTML: { __html: '<svg width="' + (size || 24) + '" height="' + (size || 24) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[n] || '') + '</svg>' } });
  }
  // Tiny markdown for previews: paragraphs, **bold**, *italic*, [links](url).
  function md(s) {
    var esc = String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return esc.split(/\n{2,}/).map(function (p) {
      return '<p>' + p.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>') + '</p>';
    }).join('');
  }
  function get(entry, path) { var v = entry.getIn(['data'].concat(path)); return v && v.toJS ? v.toJS() : v; }
  function wrap(d, el) {
    var show = d.show !== false;
    return h('div', null, show ? null : h('p', { className: 'pv-note' }, 'This section is hidden on the live page.'), h('div', { className: show ? '' : 'pv-hidden' }, el));
  }
  function photo(d, p, cls) {
    var src = d.image;
    if (src) return h('img', { className: 'photo', src: p.getAsset(src).toString(), alt: d.image_alt || '' });
    return h('div', { className: 'photo placeholder ' + cls }, icon('image', 32), h('strong', null, 'No photo yet'));
  }
  function btn(cls, label) { return h('a', { className: 'btn ' + cls, href: '#' }, label); }

  function Hero(d, p) {
    var g = function (k) { return d[k]; };
    return wrap(d, h('section', { className: 'hero bg-cloud' }, h('div', { className: 'wrap two-col' },
      h('div', { className: 'hero-media' }, photo(d, p, 'sky')),
      h('div', { className: 'hero-text' }, g('badge') ? h('span', { className: 'badge' }, g('badge')) : null,
        h('h1', null, g('headline')), h('p', { className: 'subhead' }, g('subhead')),
        h('div', { className: 'btn-row' }, btn('btn-primary', g('primary_label')), btn('btn-secondary', g('secondary_label')))))));
  }

  function About(d, p) {
    var g = function (k) { return d[k]; };
    return wrap(d, h('section', { className: 'section' }, h('div', { className: 'wrap two-col about' },
      h('div', { className: 'about-media' }, photo(d, p, 'mint')),
      h('div', null, h('p', { className: 'eyebrow' }, g('eyebrow')), h('h2', null, g('heading')), h('div', { className: 'prose' }, h('div', { dangerouslySetInnerHTML: { __html: md(d.body) } }))))));
  }

  function Programs(d, p) {
    var g = function (k) { return d[k]; };
    return wrap(d, h('section', { className: 'section bg-cloud' }, h('div', { className: 'wrap' },
      h('p', { className: 'eyebrow' }, g('eyebrow')), h('h2', { className: 'narrow' }, g('heading')),
      h('div', { className: 'cards' }, (g('cards') || []).map(function (c, i) {
        return h('article', { className: 'card', key: i }, icon(c.icon, 24, 'icon-tile icon-' + c.icon), h('h3', null, c.title), h('p', { className: 'card-body' }, c.body), h('a', { className: 'text-link', href: '#' }, (g('link_label') || '') + ' →'));
      })),
      h('div', { className: 'extras' }, (g('extras') || []).map(function (x, i) {
        return h('div', { className: 'extra ' + x.tone, key: i }, h('h3', null, x.title), h('p', null, x.body));
      })))));
  }

  function Benefits(d, p) {
    var g = function (k) { return d[k]; };
    return wrap(d, h('section', { className: 'section' }, h('div', { className: 'wrap two-col benefits' },
      h('div', null, h('p', { className: 'eyebrow' }, g('eyebrow')), h('h2', null, g('heading')), h('p', { className: 'lead' }, g('cost')), btn('btn-primary full-mobile', g('button_label'))),
      h('ul', { className: 'checklist' }, (g('items') || []).map(function (t, i) { return h('li', { key: i }, icon('check', 20), t); })))));
  }

  function Events(d, p) {
    var g = function (k) { return d[k]; };
    return wrap(d, h('section', { className: 'events bg-sky' }, h('div', { className: 'wrap events-inner' },
      icon('calendar', 24, 'icon-tile white'),
      h('div', { className: 'events-text' }, h('h2', null, g('heading')), h('p', null, g('body'))),
      h('div', { className: 'events-actions' }, btn('btn-primary full-mobile', g('button_label')), h('a', { className: 'text-link', href: '#' }, g('email_label'))))));
  }

  function Faq(d, p) {
    var g = function (k) { return d[k]; };
    var card = h('div', { className: 'ask-card', style: { marginTop: '32px' } }, icon('chat', 24, 'icon-tile white'), h('h3', null, g('card_heading')), h('p', null, g('card_body')), btn('btn-secondary btn-sm', g('card_button')));
    return wrap(d, h('section', { className: 'section' }, h('div', { className: 'wrap two-col faq' },
      h('div', null, h('p', { className: 'eyebrow' }, g('eyebrow')), h('h2', null, g('heading')), h('p', { className: 'lead' }, g('intro')), card),
      h('div', { className: 'faq-list' }, (g('items') || []).map(function (q, i) {
        return h('details', { key: i, open: true }, h('summary', null, h('h3', null, q.question), icon('chevron', 20, 'chev')), h('div', { className: 'answer', dangerouslySetInnerHTML: { __html: md(q.answer) } }));
      })))));
  }

  function Cta(d, p) {
    var g = function (k) { return d[k]; };
    return wrap(d, h('section', { className: 'cta' }, h('div', { className: 'wrap center' }, h('h2', null, g('heading')), h('p', null, g('body')), btn('btn-green full-mobile', g('button_label')))));
  }

  var Settings = createClass({ render: function () {
    var p = this.props, e = p.entry, g = function (k) { return get(e, k) || {}; };
    var site = g(['site']), header = g(['header']), footer = g(['footer']), links = g(['links']), contact = g(['contact']);
    var logo = site.logo ? p.getAsset(site.logo).toString() : '';
    function row(label, value) { return h('li', null, h('strong', null, label + ': '), value && !/^JOINIT_/.test(value) ? value : h('em', { style: { color: '#B3261E' } }, 'not set yet')); }
    return h('div', null,
      h('header', { className: 'site-header' }, h('div', { className: 'wrap header-inner' },
        h('a', { className: 'logo', href: '#' }, logo ? h('img', { src: logo, alt: site.logo_alt }) : null),
        h('nav', { className: 'nav-desktop', style: { display: 'flex', gap: '20px', flexWrap: 'wrap' } }, (header.nav || []).map(function (n, i) { return h('a', { className: 'nav-link', href: '#', key: i }, n.label); })),
        h('div', { className: 'header-actions' }, h('a', { className: 'text-link', href: '#' }, header.login_label), btn('btn-primary btn-sm', header.join_label)))),
      h('section', { className: 'section bg-cloud', style: { padding: '32px 0' } }, h('div', { className: 'wrap' },
        h('h3', null, 'Join It links and contact'),
        h('ul', { className: 'prose', style: { paddingLeft: '20px' } }, row('Membership signup', links.join), row('Member login', links.login), row('Member portal / events', links.portal), row('Contact email', contact.email)))),
      h('footer', { className: 'site-footer' }, h('div', { className: 'wrap footer-grid', style: { gridTemplateColumns: '1fr' } },
        h('div', null, logo ? h('img', { className: 'f-logo', src: logo, alt: '' }) : null, h('p', null, footer.nonprofit), h('p', null, 'Federal Tax ID (EIN): ' + (footer.ein || '') + ' · ' + (footer.serving || ''))),
        h('div', null, h('p', { className: 'f-head' }, footer.social_heading), h('ul', { className: 'f-social' }, (footer.social || []).filter(function (x) { return x.url; }).map(function (x, i) { return h('li', { key: i }, h('a', { href: '#' }, icon(x.icon, 18, 'icon-tile sm'), h('span', null, h('strong', null, x.label), h('small', null, x.sublabel)))); }))),
        h('div', null, h('p', { className: 'f-head' }, footer.resources_heading), h('ul', { className: 'f-links' }, (footer.resources || []).map(function (r, i) { return h('li', { key: i }, h('a', { className: 'text-link', href: '#' }, r.label)); }))),
        h('p', { className: 'muted' }, '© ' + new Date().getFullYear() + ' ' + (footer.copyright || '')))));
  } });

  function TextPhoto(d, p) {
    var bg = d.background === 'cloud' ? ' bg-cloud' : '';
    return wrap(d, h('section', { className: 'section' + bg }, h('div', { className: 'wrap two-col block-tp' + (d.photo_side === 'right' ? ' photo-right' : '') },
      h('div', { className: 'tp-media' }, d.image ? photo(d, p, 'mint') : null),
      h('div', null, d.eyebrow ? h('p', { className: 'eyebrow' }, d.eyebrow) : null, h('h2', null, d.heading),
        h('div', { className: 'prose', dangerouslySetInnerHTML: { __html: md(d.body) } }),
        d.button_label && d.button_url ? btn('btn-primary', d.button_label) : null))));
  }
  function Text(d) {
    var bg = d.background === 'cloud' ? ' bg-cloud' : '';
    return wrap(d, h('section', { className: 'section' + bg }, h('div', { className: 'wrap block-text' + (d.centered ? ' center' : '') },
      d.eyebrow ? h('p', { className: 'eyebrow' }, d.eyebrow) : null, h('h2', null, d.heading),
      h('div', { className: 'prose', dangerouslySetInnerHTML: { __html: md(d.body) } }),
      d.button_label && d.button_url ? btn('btn-primary', d.button_label) : null)));
  }
  var RENDER = { hero: Hero, about: About, programs: Programs, benefits: Benefits, events: Events, faq: Faq, cta: Cta, textphoto: TextPhoto, text: Text };

  var Layout = createClass({ render: function () {
    var p = this.props, list = get(p.entry, ['sections']) || [];
    if (!list.length) return h('p', { className: 'pv-note' }, 'No sections yet. Use "Add section" on the left.');
    return h('main', null, list.map(function (d, i) {
      var r = d && RENDER[d.type];
      return h('div', { key: i }, r ? r(d, p) : h('p', { className: 'pv-note' }, 'Unknown section type'));
    }));
  } });

  CMS.registerPreviewTemplate('home', Layout);
  CMS.registerPreviewTemplate('settings', Settings);
})();
