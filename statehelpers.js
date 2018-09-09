const express = require('express')
    , passport = require('passport')
    , session = require('express-session')
    , docusign = require('docusign-esign')
    , moment = require('moment')
    , fs = require('fs-extra')
    , path = require('path')
    , {promisify} = require('util') // http://2ality.com/2017/05/util-promisify.html
    , async = require('async')

;


function make_promise(obj, method_name) {
    let promise_name = method_name + '_promise';
    if (!(promise_name in obj)) {
        obj[promise_name] = promisify(obj[method_name]).bind(obj)
    }
    return obj[promise_name]
}

function signDocuments(providerName, providerEmail, patientName, patientEmail, prescriptions = "") {
    let integratorKey = 'f457646d-2752-4789-b16f-e257ae060c3a';                 // Integrator Key associated with your DocuSign Integration
    let email = 'lhussain@princeton.edu';                           // Email for your DocuSign Account
    let password = 'Hussain123!';                       // Password for your DocuSign Account
    let docusignEnv = 'demo';                       // DocuSign Environment generally demo for testing purposes
    let firstRecipientFullName = providerName;                // First Recipient's Full Name
    let firstRecipientEmail = providerEmail;            // First Recipient's Email Address
    let firstRecipientRoleName = 'Provider'         // First Recipient's Template Role
    let secondRecipientFullName = patientName;      // Second Recipient's Full Name
    let secondRecipientEmail = patientEmail;            // Second Recipient's Email Address
    let secondRecipientRoleName = 'Patient';        // Second Recipient's Template Role
    let firstTemplateId = 'c76d7186-3319-4485-8f29-b80510e905b1';                   // ID of the Template

    let preFillTextTabValue = secondRecipientFullName;
    let preFillTextTabName = 'nameTab';

    let preFillTextTabValue2 = prescriptions;
    let preFillTextTabName2 = 'medicineNames';

    var userId = 'e723627d-4ae2-4e74-9af9-27cdc0fe38aa';
    var accountId = '97a76b19-e6e9-486a-b85a-2db8ae10d10c';

    let apiClient = new docusign.ApiClient();
    apiClient.setBasePath('https://' + docusignEnv + '.docusign.net/restapi');

// create JSON formatted auth header
    let creds = JSON.stringify({
        Username: email,
        Password: password,
        IntegratorKey: integratorKey
    });


    apiClient.addDefaultHeader('X-DocuSign-Authentication', creds); // Change to JWT later

// assign api client to the Configuration object
    docusign.Configuration.default.setDefaultApiClient(apiClient);

    let envDef = new docusign.EnvelopeDefinition();
    let compositeTemplateList = [];
    let serverTemplateList = [];
    let inlineTemplateList = [];


//Create the list for signers
    let signerList = [];

//Create Signer 1
    let firstRecipient = new docusign.Signer();
    firstRecipient.email = firstRecipientEmail;
    firstRecipient.name = firstRecipientFullName;
    firstRecipient.clientUserId = '1001';
    firstRecipient.recipientId = '1';
    firstRecipient.roleName = firstRecipientRoleName;
    firstRecipient.routingOrder = '1';

    var txtTabInfo = new docusign.Text();
    txtTabInfo.tabLabel = preFillTextTabName;
    txtTabInfo.value = preFillTextTabValue;

    var txtTabInfo2 = new docusign.Text();
    txtTabInfo2.tabLabel = preFillTextTabName2;
    txtTabInfo2.value = preFillTextTabValue2;

    var tabs = new docusign.Tabs();
    tabs.textTabs = [];
    tabs.textTabs.push(txtTabInfo);
    tabs.textTabs.push(txtTabInfo2);
    firstRecipient.tabs = tabs;


//Create Signer 2
    let secondRecipient = new docusign.Signer();
    secondRecipient.email = secondRecipientEmail;
    secondRecipient.name = secondRecipientFullName;
    secondRecipient.recipientId = '2';
    secondRecipient.roleName = secondRecipientRoleName;
    secondRecipient.routingOrder = '2';


//Add both to the signerList
    signerList.push(firstRecipient);
    signerList.push(secondRecipient);

//Create the Inline Template and add it to the list
    let inlineTemplate = new docusign.InlineTemplate();
    let template1Recipients = new docusign.Recipients();
    template1Recipients.signers = signerList;
    inlineTemplate.sequence = '1';
    inlineTemplate.recipients = template1Recipients;


    inlineTemplateList.push(inlineTemplate);


//Then create the Server Template and add it to the list
    let serverTemplate = new docusign.ServerTemplate();
    serverTemplate.sequence = '1';
    serverTemplate.templateId = firstTemplateId;

    serverTemplateList.push(serverTemplate);

//Now create the Composite Template and add both lists along with the compositeTemplateId
    let compositeTemplate = new docusign.CompositeTemplate();
    compositeTemplate.compositeTemplateId = 'ctemplate1';
    compositeTemplate.serverTemplates = serverTemplateList;
    compositeTemplate.inlineTemplates = inlineTemplateList;


//Then add the Composite Template to the list
    compositeTemplateList.push(compositeTemplate);


    envDef.compositeTemplates = compositeTemplateList;
    envDef.status = 'sent';
    envDef.emailSubject = 'Your new prescription!';
    envDef.emailBlurb = 'Hi Patient, please find attached a PDF copy of your new prescription electronically signed for by your doctor.';

    envDef.cdseMode = false;

    let output = JSON.parse(JSON.stringify(envDef));

    console.dir(output, {depth: null, colors: true});

    let envelopesApi = new docusign.EnvelopesApi();
    let EnvelopeSummary = new docusign.EnvelopeSummary();

//Attempt the envelope send.
    let createEnvelope_promise = make_promise(envelopesApi, 'createEnvelope');
    return (
        createEnvelope_promise(accountId, {'envelopeDefinition': envDef})
            .then((result) => {
                let msg = `\nCreated the envelope! Result: ${JSON.stringify(result)}`
                console.log(envDef);
                console.log(msg);
                // instantiate a new EnvelopesApi object
                var envelopesApi = new docusign.EnvelopesApi();

// set the url where you want the recipient to go once they are done signing
// should typically be a callback route somewhere in your app
                var viewRequest = new docusign.RecipientViewRequest();
                viewRequest.returnUrl = 'https://www.docusign.com/';
                viewRequest.authenticationMethod = 'email';

// recipient information must match embedded recipient info we provided in step #2
                viewRequest.email =  providerEmail;
                viewRequest.userName = providerName;
                viewRequest.recipientId = '1';
                viewRequest.clientUserId = '1001';

// call the CreateRecipientView API

                envelopesApi.createRecipientView(accountId, result.envelopeId, {'recipientViewRequest': viewRequest}, function (error, recipientView, response) {
                    if (error) {
                        console.log(result.envelopeId);
                        console.log('Error: ' + error);
                        console.log(error.response.body);
                        return;
                    }

                    if (recipientView) {
                        console.log('ViewUrl: ' + JSON.stringify(recipientView));
                    }
                    // let returnBundle = {envelopeId: result.envelopeId, url: JSON.stringify(recipientView.url)};
                    // JSON.stringify()
                    let justinsBigOlDick = {url: recipientView.url, envelopeId: result.envelopeId};
                    console.log(JSON.stringify(justinsBigOlDick));
                    return justinsBigOlDick;
                });
                return {msg: msg, envelopeId: result.envelopeId};

            })
            .catch((err) => {
                // If the error is from DocuSign, the actual error body is available in err.response.body
                let errMsg = err.response && err.response.body && JSON.stringify(err.response.body)
                    , msg = `\nException while creating the envelope! Result: ${err}`;
                if (errMsg) {
                    msg += `. API error message: ${errMsg}`;
                }
                console.log(msg);
                return {msg: msg};
            })
    )
}

// signDocuments('provider', 'provider@mailinator.com', 'patient', 'patient@mailinator.com', 'give the boi his drugs');
