// Simple test script to check backend connectivity
const testBackend = async () => {
  console.log('Testing backend connectivity...');
  
  try {
    // Test 1: Basic health check
    console.log('\n1. Testing basic connectivity...');
    const healthResponse = await fetch('http://localhost:5001/api/v1/users');
    console.log('Health check status:', healthResponse.status);
    
    // Test 2: Try registration
    console.log('\n2. Testing registration...');
    const testUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'password123'
    };
    
    const registerResponse = await fetch('http://localhost:5001/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    console.log('Register response status:', registerResponse.status);
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('Registration successful:', registerData);
    } else {
      let errorText = '';
      try {
        const errorData = await registerResponse.json();
        errorText = JSON.stringify(errorData, null, 2);
      } catch (e) {
        errorText = await registerResponse.text();
      }
      console.log('Registration failed:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testBackend();
}

module.exports = { testBackend };
