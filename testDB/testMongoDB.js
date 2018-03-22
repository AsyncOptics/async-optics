const mongoose = require('mongoose');
const Test = require('./TestModel.js');


Test.create({
	item: 'test1',
	number: 1,
	createdAt: {type: Date, default: Date.now}
}, (err, test) => {
	if(err) console.log('CREATE ERR', err)
		else console.log('CREATE', test)
});

// Test.find({}, (err, test) => {
// 	if(err) console.log('FIND ERR', err)
// 	else console.log('FIND', test)
// })

// Test.findOneAndRemove({item: 'test1'}, (err, test) => {
// 	if(err) console.log('FOAR ERR', err)
// 	else console.log('FOAR', test)
// })