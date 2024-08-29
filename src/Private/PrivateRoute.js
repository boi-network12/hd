import React, {  } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const PrivateRoute = ({ element: Component, ...rest}) => {
    const { currentUser } = useAuth();

    return currentUser ? <Component {...rest}/> : <Navigate to="/" />;

}

export default PrivateRoute;