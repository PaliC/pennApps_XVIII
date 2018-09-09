// instantiate a new EnvelopesApi object
var envelopesApi = new docusign.EnvelopesApi();

// Loop through the envelope documents and download each one.
for (var i = 0; i < docsList.envelopeDocuments.length; i++) {
  var documentId = docsList.envelopeDocuments[i].documentId;
  // call the getDocument() API
  envelopesApi.getDocument(accountId, envelopeId, documentId, null, function (error, document, response) {
    if (error) {
      console.log('Error: ' + error);
      return;
    }
    if (document) {
      try {
        var fs = require('fs');
        var path = require('path');
        // download the document pdf
        var filename = envelopeId + '_' + documentId + '.pdf';
        var tempFile = path.resolve(__dirname, filename);
        fs.writeFile(tempFile, new Buffer(document, 'binary'), function (err) {
          if (err) console.log('Error: ' + err);
        });
        console.log('Document ' + documentId + ' from envelope ' + envelopeId + ' has been downloaded to:\n' + tempFile);
      } catch (ex) {
        console.log('Exception: ' + ex);
      }
    }
  });
}