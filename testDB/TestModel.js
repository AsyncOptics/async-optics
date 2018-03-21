const mongoose = require('mongoose');
const Schema = mongoose.Schema

const mongoURI = 'mongodb://alektest:nnn123@ds249798.mlab.com:49798/iteration_deep';
mongoose.connect(mongoURI);

const testSchema = new Schema({
	item: { type: String, required: true},
	number: { type: Number },
	createdAt: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Test', testSchema)
