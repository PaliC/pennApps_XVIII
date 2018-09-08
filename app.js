/*=========== AUTHENTICATION ROUTES ================ */
const express = require('express');
const docusign = require('docusign-esign');
const async = require('async');
const path = require('path');

let integratorKey = 'f457646d-2752-4789-b16f-e257ae060c3a'; // Integrator Key associated with your DocuSign Integration
let email = '';  // Email for your DocuSign Account
let password = ''; 
var userId = 'e723627d-4ae2-4e74-9af9-27cdc0fe38aa';
var accountId = '97a76b19-e6e9-486a-b85a-2db8ae10d10c';

let apiClient = new docusign.ApiClient();
apiClient.setBasePath('https://demo.docusign.net/restapi');

// create JSON formatted auth header
let creds = JSON.stringify({
    Username: 'lhussain@princeton.edu',
    Password: 'Hussain123!',
    IntegratorKey: integratorKey
});

apiClient.addDefaultHeader('X-DocuSign-Authentication', creds); // Change to JWT later

// assign api client to the Configuration object
docusign.Configuration.default.setDefaultApiClient(apiClient);

/*=========== USING DOCUSIGN API ================ */
// create a new envelope object that we will manage the signature request through
var envDef = new docusign.EnvelopeDefinition();
envDef.emailSubject = 'Please sign this document sent from Node SDK';
envDef.templateId = 'c76d7186-3319-4485-8f29-b80510e905b1';

// create a template role with a valid templateId and roleName and assign signer info
var tRole = new docusign.TemplateRole();
tRole.roleName = 'Doctor';
tRole.name = 'Labib Hussain';
tRole.email = 'lhussain@princeton.edu';

var tRole2 = new docusign.TemplateRole();
tRole2.roleName = 'Patient';
tRole2.name = 'Labib Hussain';
tRole2.email = 'lhussain@princeton.edu';

// create a list of template roles and add our newly created role
var templateRolesList = [];
templateRolesList.push(tRole);
templateRolesList.push(tRole2);

// assign template role(s) to the envelope
envDef.templateRoles = templateRolesList;

// send the envelope by setting |status| to 'sent'. To save as a draft set to 'created'
envDef.status = 'sent';

// use the |accountId| we retrieved through the Login API to create the Envelope
var accountId = '6437293';

// instantiate a new EnvelopesApi object
let envelopesApi = new docusign.EnvelopesApi();
let EnvelopeSummary = new docusign.EnvelopeSummary();

// call the createEnvelope() API
EnvelopeSummary = envelopesApi.createEnvelope(accountId, { 'envelopeDefinition': envDef }, function (err, envelopeSummary, response) {
    if (err) {
        console.log(err);
    }
    console.log('EnvelopeSummary: ' + JSON.stringify(EnvelopeSummary));
});

/* ================== LOCALHOST CONNECTION =========== */
