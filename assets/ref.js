// Affiliate referral attribution — reads ?ref=, remembers it (first-touch),
// and tags Stripe + Cal.com links on the page so conversions can be attributed.
(function () {
  var STORAGE_KEY = 'ff_ref';
  var CLICK_ENDPOINT = 'https://qahriykfwknuoqctsaek.supabase.co/functions/v1/affiliate-click';

  var params = new URLSearchParams(window.location.search);
  var urlRef = params.get('ref');

  var storedRef = null;
  try { storedRef = window.localStorage.getItem(STORAGE_KEY); } catch (e) {}

  if (urlRef && !storedRef) {
    try { window.localStorage.setItem(STORAGE_KEY, urlRef); } catch (e) {}
  }

  var ref = urlRef || storedRef;
  if (!ref) return;

  // Log the click only when the ref actually arrived via this page's URL (not a stored replay).
  if (urlRef) {
    try {
      fetch(CLICK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: urlRef, page: window.location.pathname }),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }

  function tagLinks() {
    document.querySelectorAll('a[href*="buy.stripe.com"]').forEach(function (a) {
      if (a.href.indexOf('client_reference_id=') !== -1) return;
      var sep = a.href.indexOf('?') === -1 ? '?' : '&';
      a.href = a.href + sep + 'client_reference_id=' + encodeURIComponent(ref);
    });

    document.querySelectorAll('[data-cal-link]').forEach(function (el) {
      var link = el.getAttribute('data-cal-link');
      if (!link || link.indexOf('utm_campaign=') !== -1) return;
      var sep = link.indexOf('?') === -1 ? '?' : '&';
      el.setAttribute('data-cal-link', link + sep + 'utm_source=affiliate&utm_campaign=' + encodeURIComponent(ref));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tagLinks);
  } else {
    tagLinks();
  }
})();
