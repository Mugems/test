
import jwt from 'jwt-decode';

export function getToken(){
    const token = localStorage.getItem("access_token");
    return  token;
}

// // Stores user info into the memory
export function setUser(user){ 
    localStorage.setItem("authUser", JSON.stringify(user));
}

export function unsetToken(){
  
    localStorage.removeItem("access_token");
}

// Parses JWT token and returns the token expiration date
export function getTokenExpiration(){
    var token = getToken();
  
    let decoded = jwt(token);
    
    return new Date(decoded.exp * 1000);
}

// Checks whether the token is expired or not
export function isTokenExpired() {

    if (!getToken()) return true;

    return (getTokenExpiration()).getTime() <= (new Date()).getTime();
}


// // const user = localStorage.getItem("authUser");

// // const accessToken = "JWT " + user.accessToken;

// // export default accessToken