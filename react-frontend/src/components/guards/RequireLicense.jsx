import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

const RequireLicense = () => {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    // Read persisted license state
    const licenseValid = localStorage.getItem("license_valid");

    if (licenseValid === "true") {
      setStatus("valid");
    } else {
      setStatus("invalid");
    }
  }, []);

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center", marginTop: "40vh" }}>
        Checking license…
      </div>
    );
  }

  if (status === "invalid") {
    return <Navigate to="/license" replace />;
  }

  return <Outlet />;
};

export default RequireLicense;
