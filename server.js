require('dotenv/config');
const mongoose = require('mongoose');
const app = require('./app');

// creating a connection/
mongoose.connect(process.env.MONGODB_URL)
.then(()=>{
console.log('connected to the database!!!')
})
.catch((error)=>{
    console.log('MONGODB CONNECTION FAILED');
})

const port  = process.env.PORT || 3001

app.listen(port, ()=>{
    console.log('app is running up on the server !!');
})
