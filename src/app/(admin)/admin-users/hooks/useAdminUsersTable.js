"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  fetchAdminUsers,
  lockAdminUser,
  unlockAdminUser,
  deleteAdminUser,
} from "../services/usersAdminService";

export function useAdminUsersTable({ search, refreshTrigger }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, dir: "asc" });

  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    user: null,
    type: "lock",
  });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = !q
      ? users
      : users.filter((user) => {
          const name = (user.name || "").toLowerCase();
          const email = (user.email || "").toLowerCase();
          const role = (user.role || "").toLowerCase();
          const phone = user.addreses?.[0]?.phone || "";
          return (
            name.includes(q) ||
            email.includes(q) ||
            phone.includes(q) ||
            role.includes(q)
          );
        });

    if (!sortConfig.key) return list;
    return [...list].sort((a, b) => {
      const aVal = (a[sortConfig.key] || "").toString().toLowerCase();
      const bVal = (b[sortConfig.key] || "").toString().toLowerCase();
      return sortConfig.dir === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [users, search, sortConfig]);

  const toggleSort = useCallback((key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }, []);

  const handleEdit = useCallback((user) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  }, []);

  const requestAction = useCallback((user, type) => {
    setConfirmConfig({ open: true, user, type });
  }, []);

  const executeAction = useCallback(async () => {
    const { user, type } = confirmConfig;
    if (!user?._id) return;

    setIsActionLoading(true);
    try {
      if (type === "lock") {
        await lockAdminUser(user._id);
        toast.success(`Đã khóa tài khoản ${user.name}`);
      } else if (type === "delete") {
        await deleteAdminUser(user._id);
        toast.success(`Đã xóa tài khoản ${user.name}`);
      }
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    } finally {
      setIsActionLoading(false);
      setConfirmConfig((prev) => ({ ...prev, open: false }));
    }
  }, [confirmConfig, fetchUsers]);

  const handleUnlock = useCallback(
    async (user) => {
      try {
        await unlockAdminUser(user._id);
        toast.success(`Đã mở khóa tài khoản ${user.name}`);
        fetchUsers();
      } catch {
        toast.error("Mở khóa thất bại");
      }
    },
    [fetchUsers],
  );

  return {
    users,
    filteredUsers,
    isLoading,
    sortConfig,
    toggleSort,
    selectedUser,
    isEditDialogOpen,
    setIsEditDialogOpen,
    confirmConfig,
    setConfirmConfig,
    isActionLoading,
    handleEdit,
    requestAction,
    executeAction,
    handleUnlock,
    fetchUsers,
  };
}
