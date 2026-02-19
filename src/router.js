export class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;

    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname, false);
    });
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path, pushState = true) {
    if (pushState) {
      window.history.pushState({}, '', path);
    }

    this.currentRoute = path;
    const handler = this.routes[path] || this.routes['/404'];

    if (handler) {
      handler();
    }
  }

  getCurrentRoute() {
    return this.currentRoute || window.location.pathname;
  }
}

export const router = new Router();
