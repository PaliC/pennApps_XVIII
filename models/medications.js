var mongoose = require('mongoose');

var MedicationSchema = mongoose.Schema({

});

var MedicationModel = mongoose.model('Medication', MedicationSchema);

module.exports = MedicationModel;