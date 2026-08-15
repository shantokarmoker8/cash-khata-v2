// src/components/settings/DataBackupModal.jsx
import { useState } from "react";
import { FaDownload, FaTriangleExclamation } from "react-icons/fa6";
import Modal from "../common/Modal";
import { showToast } from "../common/Toast";
import { exportBackup, deleteAllData } from "../../services/backupService";
import { useAuth } from "../../hooks/useAuth";

export default function DataBackupModal({ isOpen, onClose }) {
  const { logout } = useAuth();
  const [view, setView] = useState("main"); // "main" | "delete"
  const [exporting, setExporting] = useState(false);

  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  function resetDeleteForm() {
    setPassword1("");
    setPassword2("");
    setConfirmText("");
    setView("main");
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportBackup();
      showToast("success", "Backup downloaded successfully");
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAll(e) {
    e.preventDefault();
    if (password1 !== password2) {
      showToast("error", "Passwords do not match");
      return;
    }

    setDeleting(true);
    try {
      await deleteAllData({ password: password1, confirmText });
      showToast("success", "All business data has been deleted");
      resetDeleteForm();
      onClose();
    } catch (err) {
      showToast("error", err.message || "Incorrect password or something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetDeleteForm();
        onClose();
      }}
      title="Data Backup"
      maxWidth="max-w-[420px]"
    >
      {view === "main" ? (
        <div>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="ck-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <FaDownload /> {exporting ? "Exporting..." : "Export Backup (JSON)"}
          </button>

          <div className="text-center mt-5 pt-4 border-t border-dashed border-border-color">
            <button
              type="button"
              onClick={() => setView("delete")}
              className="text-danger text-[13px] font-medium hover:underline"
            >
              Delete All Data
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleDeleteAll}>
          <div className="bg-red-50 text-danger rounded-[10px] px-3.5 py-2.5 text-[12px] flex items-start gap-2 mb-4">
            <FaTriangleExclamation className="mt-0.5 shrink-0" />
            <span>
              This will permanently delete all customers, suppliers, products, sales, purchases, and
              expenses. This action cannot be undone.
            </span>
          </div>

          <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Your Password</label>
          <input
            type="password"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            required
            autoComplete="off"
            className="ck-input mb-3.5"
          />

          <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Confirm Password</label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            autoComplete="off"
            className="ck-input mb-3.5"
          />

          <label className="text-[13px] font-medium text-text-dark mb-1.5 block">
            Type <strong>DELETE</strong> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            required
            autoComplete="off"
            className="ck-input"
          />

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={resetDeleteForm}
              className="flex-1 border-[1.5px] border-border-color text-text-dark rounded-[10px] py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleting}
              className="flex-1 bg-danger hover:bg-red-700 text-white rounded-[10px] py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}