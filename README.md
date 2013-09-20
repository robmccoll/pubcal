PubCal
======

A simple tracking tool for publication submission deadlines and conference dates powered by:

- [AngularJS](http://angularjs.org/)
- [Firebase](https://www.firebase.com/)
- [Bootstrap](http://getbootstrap.com/)
- [jQuery](http://jquery.com/)
- [Underscore.js](http://underscorejs.org/)

Aren't libraries the best?

Install
-------
Clone this into the place on your webserver where you want to run from.

    git clone https://github.com/robmccoll/pubcal

Create an .htaccess file to protect it or something
(Actual security coming soon).

    .htacces:
    AuthType Basic
    AuthName "PubCal"
    AuthUserFile /path/to/htpasswd
    Require valid-user

Create a conf.js file in the same directory as index.html that contains
the URL of your FirebaseIO.
    
    conf.js:
    var firebase_url = "https://<yourname>.firebaseio.com/";

Usage
-----

Pretty much self explanatory. You can edit it concurrently with no real issues (unless you edit the exact 
same event at the same time - last person to click save wins).

Simple for now, but hopefully useful.  Click an existing event to edit or remove it.  Add event 
button is in the upper right.  Events are color coded by "tier".  If you don't know an exact date, but have 
an idea of the usual month, enter 0 for the day.
