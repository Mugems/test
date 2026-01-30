import { GET } from "../helpers/api_helper";
import { CUSTOMERS, USERS, ADD_BRANCH, LINE, AREA } from "../helpers/url_helper";

export const testAPIEndpoints = async () => {
  console.log("Testing API endpoints...");
  
  try {
    // Test customers endpoint
    console.log("Testing customers endpoint...");
    const customersResponse = await GET(CUSTOMERS);
    console.log("Customers response:", customersResponse);
    
    // Test users endpoint
    console.log("Testing users endpoint...");
    const usersResponse = await GET(USERS);
    console.log("Users response:", usersResponse);
    
    // Test branches endpoint
    console.log("Testing branches endpoint...");
    const branchesResponse = await GET(ADD_BRANCH);
    console.log("Branches response:", branchesResponse);
    
    // Test lines endpoint
    console.log("Testing lines endpoint...");
    const linesResponse = await GET(LINE);
    console.log("Lines response:", linesResponse);
    
    // Test areas endpoint
    console.log("Testing areas endpoint...");
    const areasResponse = await GET(AREA);
    console.log("Areas response:", areasResponse);
    
    return {
      customers: customersResponse,
      users: usersResponse,
      branches: branchesResponse,
      lines: linesResponse,
      areas: areasResponse
    };
  } catch (error) {
    console.error("Error testing API endpoints:", error);
    return null;
  }
};

export const getCurrentUser = () => {
  try {
    const authUser = localStorage.getItem("auth_user");
    if (authUser) {
      return JSON.parse(authUser);
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}; 