import React, { useState } from "react";
import axiosWithAuth from "../../utils/axiosWithAuth";
import "./Backup.css";

const Backup = () => {
  const [format, setFormat] = useState("custom"); // custom | plain
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
      const res = await axiosWithAuth().get(
        `/backup/db?format=${format}`,
        {
          responseType: "blob", // IMPORTANT
        }
      );

      // Extract filename from headers
      const contentDisposition = res.headers["content-disposition"];
      let filename;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        filename = match?.[1];
      }

      if (!filename) {
        filename =
          format === "plain"
            ? "database_backup.sql"
            : "database_backup.backup";
      }

      // Trigger download
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
        error?.response?.data?.error || "Backup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backup-container">
      <div className="backup-wrapper">
        <div className="backup-card">
          {/* Close button */}
          <button
            className="backup-close"
            onClick={() => setVisible(false)}
            title="Close"
          >
            ×
          </button>

          <h2>Database Backup</h2>

          <div className="backup-field">
            <label>Backup Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              disabled={loading}
            >
              <option value="plain">Plain SQL (.sql)</option>
              <option value="custom">Custom (.backup)</option>
            </select>
          </div>

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
