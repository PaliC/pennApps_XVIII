var mongoose = require('mongoose');

var TestSchema = mongoose.Schema({

});

var TestModel = mongoose.model('Test', TestSchema);

module.export = TestModel;