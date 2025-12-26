import { Navigate, Outlet, useLocation } from "react-router-dom";

const RequireLicense = () => {
  const location = useLocation();
  const isLicenseVerified =
    localStorage.getItem("license_verified") === "true";

  if (!isLicenseVerified) {
    return (
      <Navigate
        to="/license"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default RequireLicense;
