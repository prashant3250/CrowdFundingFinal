const routes = require("next-routes")();

routes
  .add('/campaigns/new', '/campaigns/new')
  .add('/campaigns/:address', '/campaigns/show')
  .add('/campaigns/:address/requests', '/campaigns/requests/index')
  .add('/campaigns/:address/requests/new', '/campaigns/requests/new')
  .add('/register', '/register') // Register route
  .add('/login', '/login')       // Login route
  .add('/profile', '/profile')   // Profile route
  .add('/admin', '/admin');

module.exports = routes;
