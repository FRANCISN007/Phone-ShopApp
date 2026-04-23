import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const RequireAuth = () => {
  const location = useLocation();
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsValid(false);
        return;
      }

      try {
        await axios.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsValid(true);
      } catch {
        localStorage.removeItem("token");
        setIsValid(false);
      }
    };

    verify();
  }, []);

  if (isValid === null) return <div>Loading...</div>;

  if (!isValid) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireAuth;
