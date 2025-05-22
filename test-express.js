console.log('Starting Express test...');

try {
  const express = require('express');
  console.log('Express loaded successfully');
  
  const app = express();
  console.log('Express app created');
  
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Error loading Express:', error);
} 