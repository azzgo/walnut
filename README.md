Walnut
=================

This is a tiny pure JS/HTML/CSS app for monitoring third party services, integrating with CI, London metro or whatever you like and displaying it on your wall!

Features
========

* No deployment: JS only
* Five visual states for services
* Plays the [inception](http://inception.davepedu.com/) sound if a service fails
* Polls server every 30 seconds
* Non-blocking
* Good for displaying on a flatscreen TV

<img src="http://i.imgur.com/4lKdJ6X.jpg?1"/>

[Screenshot](http://i.imgur.com/U8nTW.png?6291)

Service States
--------------

* Green: up and running
* Red: service is misbehaving
* Polling service: making HTTP request to a status api/page
* Pending: good for CI build/test process
* Unknown: HTTP request to a status page/api has failed

Limitations
==========

Due to security reasons browsers do not allow cross-domain AJAX requests, therefore you have to configure your browser accordingly. Please do so at your own risk!

Monitoring other services
=========================

It is very easy to add any service you want. Just add another service to the `services.js` file. Here's a helpful example:

    Service({
      name: 'Some Cool Apps',                 // will be displayed in the view
      url: 'https://example.com/status.json', // url to call
      dataType: "json",                       // optional. datatype to set in http header
      username: 'jamesbond',                  // optional. http basic auth username
      password: 'secret007',                  // optional. http basic auth password

                                              // a function to parse the response.
                                              // must return true, false or "pending"
      status: function(response) {            // 
        return JSON.parse(response)["status"] == "ok";
      }
    });

