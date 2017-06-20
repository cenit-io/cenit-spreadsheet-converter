# SpreadsheetConverter Node.js adaptor for CenitIO

[![N|Solid](http://www.spreadsheetconverter.com/wp-content/uploads/2013/08/logo.png)](http://www.spreadsheetconverter.com)

CenitSpreadsheetConverter is a helper module for SpreadsheetConverter Node.js calculator app to save your form submissions into 
your [CenitIO Tenant](https://cenit.io/). With a small code manipulation inside the calculator app, you can easily connect 
your form to your CenitIO Tenant.

### Installation

Install app dependencies and cenit-spreadsheet-converter in your app by typing following in command prompt.

```sh
npm install
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
    "dataTypeNamespaceSlug": null,
    "tenantAccessKey": "**********",
    "tenantAccessToken": "********************",
    
    "selectionItems": {
      "field_id_1": {
        "remote": {
          "apiService": "data_service/data1",
          "rField": "data1s",
          "vField": "ci",
          "lField": "name"
        }
      },

      "field_id_2": {
        "options": [
          {"value": 100, "label": "A"},
          {"value": 200, "label": "B"},
          {"value": 300, "label": "C"}
        ]
      },

      "field_id_3": {
        "options": [100, 200]
      }
    }
  }
}
```

#### Parameters description:

* **baseApiUrl:**             (REQUIRED) Base URL to CenitIO API.
* **dataTypeName:**           (REQUIRED) Data type name.
* **dataTypeNamespace:**      (REQUIRED) Data type namespace.
* **dataTypeNamespaceSlug:**  (OPTIONAL) Data type namespace slug. If dtNamespaceSlug value is undefined, null or false, 
                                         then will be requested in the submit action.
                                         
* **tenantAccessKey:**        (OPTIONAL) Tenant access key. If key value is undefined, null or false, then will be 
                                         take form TENANT_ACCESS_KEY environment.
                                         
* **tenantAccessToken:**      (OPTIONAL) Tenant access key. If token value is undefined, null or false, then will be 
                                         take form TENANT_ACCESS_TOKEN environment.
                                  
* **selectionItems:**   (OPTIONAL) Configuration of items that will be transformed in select box components. The name of 
                                   each element setting must be the value of the id attribute of the field in the form.
                                   The value can be the configuration to obtain the options from a remote service of 
                                   CenitIO or it can be the list of options.
                                   
* **options:**          (OPTIONAL) List (array) of static options. Each option can be an object if value is different to 
                                   label such as ``{ value: '1', label: 'A' }``, or a single value if it is equal to label.
                                   
* **remote:**           (OPTIONAL) Configuration to obtain the options from a remote service of CenitIO.

* **apiService:**       (REQUIRED) Url to REST API service in CenitIO. It is (Namespace slug/Model slug).
* **rField:**           (REQUIRED) Attribute name that contain the records. Usually it is the resource name pluralization.
* **vField:**           (REQUIRED) Record attribute use to get option value.
* **lField:**           (REQUIRED) Record attribute use to get option label.
                             
                             
### Conclusion

You are done now, you have configured the SpreadsheetConverter Node.js calculator app to your CenitIO Tenant to persist your form.

Start your node app and you are good to go!

Just hit the Submit button on webpage to test it out!
