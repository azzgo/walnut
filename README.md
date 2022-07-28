Walnut
=================

Tiny CI Monitor with python CGI

Features
========

* Plays the [inception](http://inception.davepedu.com/) sound if a service fails
* Polls server every 30 seconds
* Non-blocking
* Good for displaying on a flatscreen TV



Service States
--------------

* Green: up and running
* Red: service is misbehaving
* Polling service: making HTTP request to a status api/page
* Pending: good for CI build/test process
* Unknown: HTTP request to a status page/api has failed


Monitoring other services
=========================
add to end of app.js

```js
Service({
  name: 'Some Cool Apps',                 // will be displayed in the view
  url: '/cgi-bin/ci.sh',                  // url to call
  status: function(response) {            // response json
    return response.status === 'success';
  }
});
```

and run main.sh in root project

```sh
./main.sh
```

visit http://localhost:8000 you can see it
