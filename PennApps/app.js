const express = require('express');
const docusign = require('docusign-esign');
const apiClient = new docusign.ApiClient();

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

const integratorKey = 'f457646d-2752-4789-b16f-e257ae060c3a'; // An IK for a non-mobile docusign account
const clientSecret = '502a911c-0ff3-43b0-b426-077eb3c79588';
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
            console.log("Access Token: " + oAuthToken.accessToken);
            // parse first account's baseUrl
            // below code required for production, no effect in demo (same
            // domain)
            apiClient.setBasePath(userInfo.accounts[0].baseUri + "/restapi");
            res.send(userInfo);
        });
    });
});

app.listen(port, host, function (err) {
    if (err)
        throw err;

    console.log('Your server is running on http://' + host + ':' + port + '.');
});