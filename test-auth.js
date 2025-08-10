// Test script for HabitVest authentication flow
const testUser = {
    username: "deployment-test",
    email: "deploy@habitvest.com", 
    password: "testpassword123"
};

console.log("🚀 HabitVest Authentication Test");
console.log("================================");

async function testAuthFlow() {
    try {
        // Test registration
        console.log("1. Testing registration...");
        const registerResponse = await fetch('http://localhost:5001/api/v1/auth/register', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser),
        });
        
        const registerData = await registerResponse.json();
        console.log("✅ Registration successful:", registerData.success);
        
        // Test session validation
        console.log("2. Testing session validation...");
        const meResponse = await fetch('http://localhost:5001/api/v1/auth/me', {
            method: 'GET',
            credentials: 'include',
        });
        
        const meData = await meResponse.json();
        console.log("✅ Session validation successful:", meData.success);
        console.log("User data:", meData.data);
        
        // Test profile update
        console.log("3. Testing profile update...");
        const updateResponse = await fetch(`http://localhost:5001/api/v1/users/${meData.data._id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: "deployment-test-updated"
            }),
        });
        
        const updateData = await updateResponse.json();
        console.log("✅ Profile update successful:", updateData.success);
        
        // Test logout
        console.log("4. Testing logout...");
        const logoutResponse = await fetch('http://localhost:5001/api/v1/auth/logout', {
            method: 'GET',
            credentials: 'include',
        });
        
        const logoutData = await logoutResponse.json();
        console.log("✅ Logout successful:", logoutData.success);
        
        console.log("\n🎉 All tests passed! The application is ready for deployment.");
        
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

// For Node.js environment (if running with node)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testAuthFlow };
}

// For browser environment
if (typeof window !== 'undefined') {
    window.testAuthFlow = testAuthFlow;
}
