// src/components/settings/MyAccountForm.jsx
import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import { showToast } from "../common/Toast";
import { updateUser } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";

export default function MyAccountForm({ isOpen, onClose }) {
  const { currentUser, isAdmin } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      setFullName(currentUser.full_name || "");
      setUsername(currentUser.username || "");
      setPassword("");
    }
  }, [isOpen, currentUser]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!currentUser) return;

    setSubmitting(true);
    try {
      await updateUser({
        id: currentUser.id,
        fullName,
        username,
        password,
        role: currentUser.role,
        isSelf: true,
        isCurrentUserAdmin: isAdmin,
      });
      showToast("success", "Account updated successfully");
      setPassword("");
      onClose();
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Account" maxWidth="max-w-[400px]">
      <form onSubmit={handleSubmit}>
        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="ck-input mb-3.5"
        />

        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="ck-input mb-3.5"
        />

        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank to keep current password"
          autoComplete="new-password"
          className="ck-input"
        />

        <button type="submit" disabled={submitting} className="ck-btn-primary w-full flex justify-center mt-4 disabled:opacity-60">
          {submitting ? "Saving..." : "Save"}
        </button>
      </form>
    </Modal>
  );
}