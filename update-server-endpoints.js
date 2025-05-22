const fs = require('fs');
const path = require('path');

// Define the updated endpoints section
const updatedEndpoints = `
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`-----------------------------------------\`);
  console.log(\`🚀 Ecommercium API server running on port \${PORT}\`);
  console.log(\`-----------------------------------------\`);
  console.log(\`Available endpoints:\`);
  console.log(\`GET     /\`);
  console.log(\`GET     /api/products\`);
  console.log(\`GET     /api/products/:id\`);
  console.log(\`POST    /api/products  (requires auth)\`);
  console.log(\`PUT     /api/products/:id  (requires auth)\`);
  console.log(\`DELETE  /api/products/:id  (requires auth)\`);
  console.log(\`GET     /api/categories\`);
  console.log(\`GET     /api/categories/:id\`);
  console.log(\`POST    /api/categories  (requires auth)\`);
  console.log(\`PUT     /api/categories/:id  (requires auth)\`);
  console.log(\`DELETE  /api/categories/:id  (requires auth)\`);
  console.log(\`GET     /api/users      (admin only)\`);
  console.log(\`POST    /api/users/register\`);
  console.log(\`POST    /api/users/login\`);
  console.log(\`GET     /api/users/profile  (requires auth)\`);
  console.log(\`-----------------------------------------\`);
}); 
`;

// Read the current server.js file
const serverFile = path.join(__dirname, 'server.js');
let serverContent = fs.readFileSync(serverFile, 'utf8');

// Find the listen section
const listenRegex = /\/\/ Start server[\s\S]*?app\.listen[\s\S]*?}\);/;

// Replace the listen section with our updated version
if (listenRegex.test(serverContent)) {
  serverContent = serverContent.replace(listenRegex, updatedEndpoints.trim());
  
  // Write the updated content back to server.js
  fs.writeFileSync(serverFile, serverContent, 'utf8');
  console.log('✅ Updated server.js with correct endpoint display');
} else {
  console.error('❌ Could not find the listen section in server.js');
}

// Now, let's stop the current servers and restart them
console.log('Please restart your server to see the updated endpoints display');
console.log('Run these commands:');
console.log('1. taskkill /f /im node.exe');
console.log('2. node server.js');
console.log('3. npx vite'); 