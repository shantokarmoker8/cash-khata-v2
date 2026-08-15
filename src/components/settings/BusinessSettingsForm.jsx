// src/components/settings/BusinessSettingsForm.jsx
import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import { showToast } from "../common/Toast";
import { updateSettings } from "../../services/settingsService";
import { useSettingsContext } from "../../hooks/useSettingsContext";

export default function BusinessSettingsForm({ isOpen, onClose }) {
  const { businessName, businessAddress, businessPhone } = useSettingsContext();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(businessName || "");
      setAddress(businessAddress || "");
      setPhone(businessPhone || "");
    }
  }, [isOpen, businessName, businessAddress, businessPhone]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      showToast("error", "Business Name is required");
      return;
    }

    setSubmitting(true);
    try {
      await updateSettings({
        business_name: name.trim(),
        business_address: address.trim(),
        business_phone: phone.trim(),
      });
      showToast("success", "Business info updated successfully");
      onClose();
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Business Info" maxWidth="max-w-[420px]">
      <form onSubmit={handleSubmit}>
        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Business Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="ck-input mb-3.5"
        />

        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Business Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="ck-input mb-3.5"
        />

        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Business Phone</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="ck-input"
        />

        <button type="submit" disabled={submitting} className="ck-btn-primary w-full flex justify-center mt-4 disabled:opacity-60">
          {submitting ? "Saving..." : "Save"}
        </button>
      </form>
    </Modal>
  );
}