import React from "react";
import { Navigate, useLocation  } from "react-router-dom";
import { isTokenExpired,  unsetToken } from "../helpers/jwt-token-access/accessToken";

function Authmiddleware(props){
  const location = useLocation();
  if (isTokenExpired()) {
    unsetToken();
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }
  
  return (<React.Fragment>
    {props.children}
  </React.Fragment>);
};

export default Authmiddleware;
