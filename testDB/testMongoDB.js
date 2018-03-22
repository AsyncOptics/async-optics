const Test = require('./TestModel.js');
const async_perf_hooks = require('../async_perf_hooks.js');
const mongoose = require('mongoose');

Test.create({
	item: 'Test2',
	number: 2,
})

// Test.create({
// 	item: 'Test4',
// 	number: 4,
// })

// Test.create({
// 	item: 'Test3',
// 	number: 3,
// })

// Test.create({
// 	item: 'Test1',
// 	number: 1,
// })

// Test.find({}, (err, test) => {
// 	if(err) {
// 		console.log('err', err)
// 	} else {
// 		console.log(test)
// 	}
// })

// Test.findOneAndRemove({number: 2}, (err, test) => {
// 	if(err) console.log('no way jose ', err)
// 	else console.log(test)
// })

// Test.findOneAndUpdate({number: 1}, {number: 6}, (err, test) => {
// 	if(err) console.log('no can do ', err)
// 	else console.log(test)
// })