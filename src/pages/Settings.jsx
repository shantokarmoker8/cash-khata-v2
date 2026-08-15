// src/pages/Settings.jsx
import { useState } from "react";
import SettingsTabs from "../components/settings/SettingsTabs";
import MyAccountForm from "../components/settings/MyAccountForm";
import BusinessSettingsForm from "../components/settings/BusinessSettingsForm";
import CashAdjustModal from "../components/settings/CashAdjustModal";
import UsersList from "../components/settings/UsersList";
import DataBackupModal from "../components/settings/DataBackupModal";
import CustomerListModal from "../components/dashboard/CustomerListModal";
import SupplierListModal from "../components/dashboard/SupplierListModal";

export default function Settings() {
  const [activeModal, setActiveModal] = useState(null);
  // possible values: "account" | "business" | "cash" | "users" | "customers" | "suppliers" | "data" | null

  function close() {
    setActiveModal(null);
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-semibold text-text-dark m-0 mb-0.5">Settings</h4>
        <p className="text-text-muted text-[13px] m-0">Manage your business, account, and data</p>
      </div>

      <SettingsTabs onSelect={setActiveModal} />

      <MyAccountForm isOpen={activeModal === "account"} onClose={close} />
      <BusinessSettingsForm isOpen={activeModal === "business"} onClose={close} />
      <CashAdjustModal isOpen={activeModal === "cash"} onClose={close} />
      <UsersList isOpen={activeModal === "users"} onClose={close} />
      <CustomerListModal isOpen={activeModal === "customers"} onClose={close} />
      <SupplierListModal isOpen={activeModal === "suppliers"} onClose={close} />
      <DataBackupModal isOpen={activeModal === "data"} onClose={close} />
    </div>
  );
}