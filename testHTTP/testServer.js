const express = require('express');
const path = require('path');
const async_perf_hooks = require('../async_perf_hooks.js');


const app = express();
function add(a, b){
	return a + b
}

app.use((req, res, next) => {
	setTimeout(() => { add(1, 2) }, 1000)
	next();
})

app.get('/', (req, res) => {
	res.send(path.join(__dirname, '../index.html'))
})

app.listen(8080);
