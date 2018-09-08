/* Module dependencies */
var mongoose = require('mongoose');

/* Module variables */
var PrescriptionSchema = mongoose.Schema({
  patient_id: {
    type: Number,
  },

});

var PrescriptionModel = mongoose.model('Prescription', PrescriptionSchema);