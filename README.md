# route-b
Route library/middleware for Node.js

# Description
It makes possible to use your files (modules) and methods in it for routing.

# Installation via npm
```bash
npm install route-b
```

# Examples of usage situations
## RestAPI by files and methods
You have such file structure:
+api/
|-posts.js
|-users.js
Each file has 5 methods: get, post, patch, delete, all
And you want that url ```GET /api/users``` call get() of users.js, ```POST /api/users``` call post() of users.js ... and so on
## Route by files and it's methods
You have such file structure:
+controllers/
|-posts.js
|-users.js
Each file has own list of methods like stats(), ready(), find() ...
And you want that url ```/posts/stats``` call stats() of posts.js, ```/users/find``` call find() of users.js ... and so on 

# Usage
## With Express.js
```javascript
var exppress = require('express');
var app      = express();
var routeB   = require('routeB');
var path     = require('path');

// RestAPI example
app.use('/api', routeB({
  dir: path.resolve(__dirname, 'api'),
    map: {
      module : 'path[0]',
      method : 'method'
    },
    defaults: {
      module : null,
      method : 'all'
    },
    errors: {
      noModule: function (req, res) {
        res.status(404).send({error: 'No source for ' + req.routeB.callObj.moduleName});
      },
      noMethod: function (req, res) {
        res.status(405).send({error: 'Method not allowed ' + req.routeB.callObj.methodName});
      }
    }
}));
```

## Options
```javascript
{
  dir: '', // Dir where your files (modules) are
  map: { // Object for setting route algorithm. Values is string- or array-path of queryObj  
    module : 'path[0]', // How find fille (module)
    method : 'path[1]' // Which method to call
  },
  defaults: { // Default names of module and method
    module : '_default',
    method : 'default'
  },
  errors: { // Error handlers
    noModule : errorHandler,
    noMethod : errorHandler
  }
}
```

Map values - is string or array value, which can be represented as path to key of queryObj. Used ```get()``` method of [lodash library](https://lodash.com/docs#get):
Examples:
- ```path[0]``` mean value of ```queryObj.path[0]```
- ```method``` mean value of ```queryObj.method```
- ```query.users[2]``` mean value of ```queryObj.query.users[2]```

```route-b``` add to ```req``` object ```routeB```. And you can
access it from your custom error handlers functions or from your controllers.
Because ```route-b``` forwards ```req, res, next``` to controllers and error handlers. 
```javascript
routeB = {
   queryObj: { // get from current query. /users/find?page=1 for example
     method : 'get', // Lowercase query method
     path   : ['users', 'find'], // Array of path parts
     query  : {page: 1} // Query object
   },
   callObj: { // There are module object, method function ant their names for current query
     moduleName: 'users', // Module name to require
     methodName: 'find', // Method name to call
     module: ..., // Module object
     method: ... // Method function
   }
}
```