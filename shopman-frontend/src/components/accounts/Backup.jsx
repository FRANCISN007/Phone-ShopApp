import React, { useState } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./Backup.css";

const Backup = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleBackup = async () => {
    const confirmBackup = window.confirm(
      "Do you want to proceed with the database backup?\n\nThis may take a few seconds."
    );

    if (!confirmBackup) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await axiosWithAuth().get("/backup/db", {
        responseType: "blob",
      });

      // Extract filename from headers
      const contentDisposition = res.headers["content-disposition"];
      let filename;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        filename = match?.[1];
      }

      if (!filename) {
        filename = "database_backup.backup";
      }

      // Create download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage("Backup completed successfully.");
    } catch (error) {
      console.error(error);

      setMessage(
        error?.response?.data?.detail || "Backup failed. insufficient permission."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backup-container">
      <div className="backup-wrapper">
        <div className="backup-card">

          {/* Close */}
          <button
            className="backup-close"
            onClick={() => setVisible(false)}
            title="Close"
          >
            ×
          </button>

          <h2>Database Backup</h2>

          <p className="backup-info">
            This will generate and download the latest database backup file.
          </p>

          <button
            className="backup-btn"
            onClick={handleBackup}
            disabled={loading}
          >
            {loading ? "Backing up..." : "Start Backup"}
          </button>

          {message && <p className="backup-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Backup;
