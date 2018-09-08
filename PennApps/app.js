const express = require('express');
const docusign = require('docusign-esign');
const apiClient = new docusign.ApiClient();

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

const integratorKey = 'f08c4f47-a461-4db0-8687-a8d3148bf206'; // An IK for a non-mobile docusign account
const clientSecret = 'b281e28e-7b12-44de-ae1e-b904c4cb2a4d';
const redirectUri = 'http://localhost:3000/auth'; // This needs to be registered with the integrator key in your admin account
const basePath = 'https://demo.docusign.net/restapi';

const responseType = apiClient.OAuth.ResponseType.CODE; // Response type of code, to be used for the Auth code grant
const scopes = [apiClient.OAuth.Scope.EXTENDED];
const randomState = "*^.$DGj*)+}Jk"; // after successful login you should compare the value of URI decoded "state" query param with the one created here. They should match

apiClient.setBasePath(basePath);

app.get('/', function (req, res) {
    const authUri = apiClient.getAuthorizationUri(integratorKey, scopes, redirectUri, responseType, randomState);//get DocuSign OAuth authorization url
    //Open DocuSign OAuth login in a browser, res being your node.js response object.
    res.redirect(authUri);
});

app.get('/auth', function (req, res) {
    // IMPORTANT: after the login, DocuSign will send back a fresh
    // authorization code as a query param of the redirect URI.
    // You should set up a route that handles the redirect call to get
    // that code and pass it to token endpoint as shown in the next
    // lines:
    apiClient.generateAccessToken(integratorKey, clientSecret, req.query.code, function (err, oAuthToken) {

        console.log(oAuthToken);

        //IMPORTANT: In order to access the other api families, you will need to add this auth header to your apiClient.
        apiClient.addDefaultHeader('Authorization', 'Bearer ' + oAuthToken.accessToken);

        apiClient.getUserInfo(oAuthToken.accessToken, function (err, userInfo) {
            console.log("UserInfo: " + userInfo);
            // parse first account's baseUrl
            // below code required for production, no effect in demo (same
            // domain)
            apiClient.setBasePath(userInfo.accounts[0].baseUri + "/restapi");


// SEND ENVELOPE
    // create a new envelope object that we will manage the signature request through
var envDef = new docusign.EnvelopeDefinition();
envDef.emailSubject = 'Please sign this document sent from Node SDK';
envDef.templateId = '564ad803-463c-458e-a726-4196effe0862';

// create a template role with a valid templateId and roleName and assign signer info
var tRole = new docusign.TemplateRole();
tRole.roleName = 'Practictioner';
tRole.name = '{USER_NAME}';
tRole.email = 'r@gmail.com';

// set the clientUserId on the recipient to mark them as embedded (ie we will generate their signing link)
tRole.clientUserId = '1001';

// create a list of template roles and add our newly created role
var templateRolesList = [];
templateRolesList.push(tRole);

// assign template role(s) to the envelope
envDef.templateRoles = templateRolesList;

// send the envelope by setting |status| to 'sent'. To save as a draft set to 'created'
envDef.status = 'sent';

// use the |accountId| we retrieved through the Login API to create the Envelope
var accountId = "759fff0c-d8e5-4c6c-b725-79a89aff2579";

// instantiate a new EnvelopesApi object
var envelopesApi = new docusign.EnvelopesApi();

// call the createEnvelope() API
envelopesApi.createEnvelope(accountId, {'envelopeDefinition': envDef}, function (err, envelopeSummary, response) {
  console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));
});

            res.send(userInfo);
        });
    });
});

app.listen(port, host, function (err) {
    if (err)
        throw err;

    console.log('Your server is running on http://' + host + ':' + port + '.');


});
