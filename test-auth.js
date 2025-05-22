const fetch = require('node-fetch');
require('dotenv').config();

// Helper function to make API calls
async function callApi(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    console.log(`Making ${method} request to ${endpoint}`);
    const response = await fetch(`http://localhost:5000/api${endpoint}`, options);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error(`API call error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

async function testAuthentication() {
  console.log('=== Testing Authentication and Admin Operations ===');
  let token = null;
  
  // Step 1: Login as admin
  console.log('\n1. Logging in as admin...');
  const loginResult = await callApi('/users/login', 'POST', {
    email: 'admin@example.com',
    password: 'admin123'
  });
  
  if (!loginResult.success) {
    console.error('Login failed:', loginResult.data?.message || 'Unknown error');
    return;
  }
  
  token = loginResult.data.token;
  console.log('✅ Login successful, token received');
  console.log('Token:', token.substring(0, 20) + '...');
  
  // Step 2: Fetch user profile to verify token works
  console.log('\n2. Fetching user profile with token...');
  const profileResult = await callApi('/users/profile', 'GET', null, token);
  
  if (!profileResult.success) {
    console.error('Profile fetch failed:', profileResult.data?.message || 'Unknown error');
    return;
  }
  
  console.log('✅ Profile fetch successful');
  console.log('User details:', {
    id: profileResult.data.id,
    email: profileResult.data.email,
    role: profileResult.data.role
  });
  
  if (profileResult.data.role !== 'admin') {
    console.error('❌ User is not an admin. Admin operations will fail.');
    return;
  }
  
  // Step 3: Create a test category to modify/delete
  console.log('\n3. Creating a test category...');
  const createCategoryResult = await callApi('/categories', 'POST', {
    name: 'Test Category ' + Date.now(),
    description: 'This is a test category for deletion',
    icon: '🧪'
  }, token);
  
  if (!createCategoryResult.success) {
    console.error('Category creation failed:', createCategoryResult.data?.message || 'Unknown error');
    return;
  }
  
  const categoryId = createCategoryResult.data.id;
  console.log(`✅ Test category created with ID: ${categoryId}`);
  
  // Step 4: Update the test category
  console.log('\n4. Updating the test category...');
  const updateCategoryResult = await callApi(`/categories/${categoryId}`, 'PUT', {
    name: 'Updated Test Category',
    description: 'This category has been updated',
    icon: '✏️'
  }, token);
  
  if (!updateCategoryResult.success) {
    console.error('Category update failed:', updateCategoryResult.data?.message || 'Unknown error');
    console.error('Full response:', updateCategoryResult);
  } else {
    console.log('✅ Category updated successfully');
    console.log('Updated category:', {
      id: updateCategoryResult.data.id,
      name: updateCategoryResult.data.name
    });
  }
  
  // Step 5: Delete the test category
  console.log('\n5. Deleting the test category...');
  const deleteCategoryResult = await callApi(`/categories/${categoryId}`, 'DELETE', null, token);
  
  if (!deleteCategoryResult.success) {
    console.error('Category deletion failed:', deleteCategoryResult.data?.message || 'Unknown error');
    console.error('Full response:', deleteCategoryResult);
  } else {
    console.log('✅ Category deleted successfully');
    console.log('Server response:', deleteCategoryResult.data);
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testAuthentication(); 