/* FLUENTR — router.js
   Minimal hash router for in-app navigation (post-login). Pre-app screens
   (profile gate, onboarding, placement) are handled directly by app.js
   before the router takes over, since they aren't bookmarkable states. */

const FluentrRouter = (function () {
  const routes = {};
  let onChange = null;
  let defaultRoute = 'home';

  function register(name, handler) { routes[name] = handler; }

  function current() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || defaultRoute;
  }

  function navigate(name) {
    if (window.location.hash === '#/' + name) { render(); return; }
    window.location.hash = '#/' + name;
  }

  function render() {
    const name = current();
    const handler = routes[name] || routes[defaultRoute];
    if (onChange) onChange(name);
    if (handler) handler();
  }

  function start(changeCallback) {
    onChange = changeCallback;
    window.addEventListener('hashchange', render);
  }

  return { register, navigate, current, start, render };
})();
