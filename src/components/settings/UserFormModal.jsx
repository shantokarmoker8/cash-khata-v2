// src/components/settings/UserFormModal.jsx
import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import { showToast } from "../common/Toast";
import { addUser, updateUser } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";

/**
 * mode: "add" | "edit"
 * targetUser: edit মোডে existing user object
 */
export default function UserFormModal({ isOpen, onClose, mode, targetUser, onSuccess }) {
  const { currentUser, isAdmin } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [submitting, setSubmitting] = useState(false);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && targetUser) {
      setFullName(targetUser.full_name || "");
      setUsername(targetUser.username || "");
      setRole(targetUser.role || "staff");
      setPassword("");
    } else {
      setFullName("");
      setUsername("");
      setRole("staff");
      setPassword("");
    }
  }, [isOpen, isEdit, targetUser]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateUser({
          id: targetUser.id,
          fullName,
          username,
          password,
          role,
          isSelf: targetUser.id === currentUser?.id,
          isCurrentUserAdmin: isAdmin,
        });
        showToast("success", "User updated successfully");
      } else {
        await addUser({
          username,
          password,
          fullName,
          role,
          isCurrentUserAdmin: isAdmin,
        });
        showToast("success", "User added successfully");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit User" : "Add User"} maxWidth="max-w-[400px]">
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

        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">
          Password {isEdit && <span className="text-text-muted font-normal">(leave blank to keep current)</span>}
        </label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEdit}
          autoComplete="new-password"
          className="ck-input mb-3.5"
        />

        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={!isAdmin}
          className="ck-input disabled:bg-slate-50 disabled:cursor-not-allowed"
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        {!isAdmin && (
          <p className="text-text-muted text-[11px] mt-1">Only an admin can change roles.</p>
        )}

        <button type="submit" disabled={submitting} className="ck-btn-primary w-full flex justify-center mt-4 disabled:opacity-60">
          {submitting ? "Saving..." : "Save"}
        </button>
      </form>
    </Modal>
  );
}