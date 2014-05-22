Settler Js
================

Better arguments

Development
-----------

Install dependencies
```sh
npm install -g gulp
npm install -g karma
npm install
```

Run the watching compiler
```sh
gulp
```

Run the specs
```sh
./node_modules/karma/bin/karma start karma.conf.js
```
or if you have the `karma-cli` installed
```sh
karma start karma.conf.js
```
(view mocha specs in the browser at [http://localhost:9876/debug.html](http://localhost:9876/debug.html))
