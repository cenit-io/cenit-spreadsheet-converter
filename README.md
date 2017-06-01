# SpreadsheetConverter Node.js adaptor for CenitIO

[![N|Solid](http://www.spreadsheetconverter.com/wp-content/uploads/2013/08/logo.png)](http://www.spreadsheetconverter.com)

CenitSpreadsheetConverter is a helper module for SpreadsheetConverter Node.js calculator app to save your form submissions into 
your [CenitIO Tenant](https://cenit.io/). With a small code manipulation inside the calculator app, you can easily connect 
your form to your CenitIO Tenant.

### Installation

Install cenit-spreadsheet-converter in your app by typing following in command prompt.

```sh
npm install cenit-io/cenit-spreadsheet-converter --save
```

### Usage

Add CenitIO connection setting to 'config.js' file. Open 'config.js' in your editor and customize this snippet code:

```json
{
  "port": 3002,
  "lcu": "test@g-forward.com",
  "source": "anywhere",
  "page": {
    "description": "",
    "error": "",
    "username": "",
    "password": "",
    "login": "",
    "message": ""
  },
  "CenitIO": {
    "baseApiUrl": "https://cenit.io/api/v2",
    "dataTypeName": "spreadsheet_test",
    "dataTypeNamespace": "Basic",
    "userAccessKey": "**********",
    "userAccessToken": "********************"
  }
}
```

Include CenitIOController in your Node.js application folder. Now you need to edit app.js to handle the form save 
post request from browser. Open app.js in your editor and paste this snippet code:


```javascript
var CenitIOController = require('cenit-spreadsheet-converter');

app.post('/postform', function(req, res){
    CenitIOController.saveFormData(req.body, config.CenitIO, function (status, msg) {
        res.status(status).send(msg);
    });
});
```

That's it, you are done with server part. 
Now come to the final part to edit, yes you are right, let's give the client side page a server address to post the form. 
Go to views folder and open index.ejs in editor, now at html form tag, change the default action url: 
'https://www.spreadsheetserver.com/server1/g/submit/submit.aspx' to your node server '/postform'. 

The index.ejs may look similar to this:
 
```html
<!DOCTYPE HTML>
<!-- saved from url=(0013)about:internet -->
<html>
...

        <form id='formc' name='formc' method='post' action='/postform' target='_top'>
            ...
        </form>
...
</html>            
```

You are done now, you have configured the SpreadsheetConverter Node.js calculator app to your CenitIO Tenant to persist your form.

Start your node app and you are good to go!

Just hit the Submit button on webpage to test it out!
