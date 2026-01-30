import { GET } from "../helpers/api_helper";
import { CUSTOMERS } from "../helpers/url_helper";

export const testCustomerAPI = async () => {
  try {
    console.log("Testing customer API endpoint...");
    const response = await GET(CUSTOMERS);
    console.log("Customer API response:", response);
    
    if (response?.status === 200) {
      console.log("Customer data:", response.data);
      return response.data;
    } else {
      console.error("Customer API error:", response);
      return null;
    }
  } catch (error) {
    console.error("Error testing customer API:", error);
    return null;
  }
};

export const getCustomerById = async (customerId) => {
  try {
    const response = await GET(`${CUSTOMERS}${customerId}/`);
    console.log("Customer by ID response:", response);
    return response?.status === 200 ? response.data : null;
  } catch (error) {
    console.error("Error getting customer by ID:", error);
    return null;
  }
}; 