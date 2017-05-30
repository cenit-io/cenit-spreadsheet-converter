# SpreadsheetConverter Node.js adaptor for Cenit-IO

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