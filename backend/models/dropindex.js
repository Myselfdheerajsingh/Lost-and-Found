const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected');
  await mongoose.connection.collection('items').dropIndex('location.coordinates_2dsphere');
  console.log('Index dropped!');
  process.exit(0);
}).catch(err => {
  console.log('Error or index not found:', err.message);
  process.exit(0);
});