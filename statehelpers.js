const docusign = require('docusign-esign');
const async = require('async');
const path = require('path');


function signDocuments(providerName, providerEmail, patientName, patientEmail, prescriptions){
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
    let secondRecipient= new docusign.Signer();
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
    envDef.emailSubject='NODE Test Send';
    envDef.emailBlurb='NODE Test Email';

    envDef.cdseMode=false;

    let output = JSON.parse(JSON.stringify(envDef));

    console.dir(output, {depth: null, colors: true});

    let envelopesApi = new docusign.EnvelopesApi();
    let EnvelopeSummary = new docusign.EnvelopeSummary();

//Attempt the envelope send.
    try{
        EnvelopeSummary = envelopesApi.createEnvelope(accountId, {'envelopeDefinition': envDef}, 'false', function (err, envelopeSummary, response) {
            if (err) {
                console.log(err);
            }
            else if (response){
                console.log('EnvelopeSummary: ' + JSON.stringify(response));

            }
        });
//Response if the call is successful
        console.log(' ');
        console.log('Response: ');
        console.log(' ');
        const response = JSON.parse(JSON.stringify(EnvelopeSummary));
        console.dir(response, {depth: null, colors: true});
    }
//Response if the call fails
    catch(error){
        console.log('Call has failed');
        console.log(error);
    }
}

