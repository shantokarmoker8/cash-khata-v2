// src/components/settings/UsersList.jsx
import { useEffect, useState } from "react";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa6";
import Modal from "../common/Modal";
import ConfirmDialog from "../common/ConfirmDialog";
import UserFormModal from "./UserFormModal";
import { showToast } from "../common/Toast";
import { subscribeToUsers, deleteUser } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";

export default function UsersList({ isOpen, onClose }) {
  const { currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToUsers((rows) => {
      setUsers(rows);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isOpen]);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser({ id: deleteTarget.id, currentUserId: currentUser?.id });
      showToast("success", "User deleted successfully");
      setDeleteTarget(null);
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Users" maxWidth="max-w-[560px]">
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={() => {
              setFormMode("add");
              setEditTarget(null);
              setFormOpen(true);
            }}
            className="ck-btn-primary flex items-center gap-2"
          >
            <FaPlus /> Add User
          </button>
        </div>

        <div className="max-h-[380px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border border-border-color rounded-[14px]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-color">
                <th className="text-xs font-semibold text-text-muted px-3.5 py-3">Name</th>
                <th className="text-xs font-semibold text-text-muted px-3.5 py-3">Username</th>
                <th className="text-xs font-semibold text-text-muted px-3.5 py-3">Role</th>
                <th className="text-xs font-semibold text-text-muted px-3.5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-muted text-sm">
                    Loading...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-border-color last:border-none">
                    <td className="px-3.5 py-3 text-[13px] text-text-dark">{u.full_name}</td>
                    <td className="px-3.5 py-3 text-[13px] text-text-muted">{u.username}</td>
                    <td className="px-3.5 py-3">
                      <span className={u.role === "admin" ? "badge-due" : "badge-cash"}>{u.role}</span>
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-1.5">
                        {(isAdmin || u.uid === currentUser?.uid) && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormMode("edit");
                              setEditTarget(u);
                              setFormOpen(true);
                            }}
                            title="Edit"
                            className="ck-icon-btn bg-blue-50 text-primary-blue hover:bg-blue-100"
                          >
                            <FaPen className="text-xs" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(u)}
                            title="Delete"
                            className="ck-icon-btn bg-red-50 text-danger hover:bg-red-100"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      <UserFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        mode={formMode}
        targetUser={editTarget}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete User?"
        message={`Are you sure you want to delete "${deleteTarget?.full_name}"?`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}