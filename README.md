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

add a cgi script in `/cgi-bin` like default one 

```sh
#!/bin/bash

echo "content-type: application/json"
echo ""


echo "{\"status\": \":failure\"}"
```

> I known the demo it is stupid, but the shell you can give more imagination of it, I used in my project, because the cicd is not the normal ones liking jenkins and gitlab ci etc.
> I found the [alphasights/walnut](https://github.com/alphasights/walnut) it is so simple code and full of features of a ci Monitors, So I change one to make the ci more pure for only status displayed. and with the power of python cgi server, I can invoke bash shell like curl to check my building status ( the curl command copy is builtin the chrome, very very helped me)


and run main.sh in root project

```sh
./main.sh
```

visit http://localhost:8000 you can see it
