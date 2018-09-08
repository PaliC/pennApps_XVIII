/* Module dependencies */
var mongoose = require('mongoose');

/* Module variables */
var PrescriptionSchema = mongoose.Schema({
  patient_id: {
    type: Number,
    required: true,
  },
  provider_id: {
    type: Number,
    required: true,
  },
  medication_id: {
    type: Nummber,
    required: true,
  },
  dosage:{
    type: Number,
    required: true,
  },
});

var PrescriptionModel = mongoose.model('Prescription', PrescriptionSchema);