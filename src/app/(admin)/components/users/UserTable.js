"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MoreHorizontal,
  Lock,
  Unlock,
  Trash2,
  UserCog,
  ShieldCheck,
  User,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserDialog from "./UserDialog";
import { ConfirmActionDialog } from "./ConfirmActionDialog";
import { userService } from "@/app/services/api/userService";
import { toast } from "sonner";

export default function UserTable({ search, refreshTrigger }) {
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

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getAllUsers();
      const data = response.data || response || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const toggleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const SortIcon = ({ col }) =>
    sortConfig.key === col ? (
      sortConfig.dir === "asc" ? (
        <ChevronUp size={12} className="inline ml-1" />
      ) : (
        <ChevronDown size={12} className="inline ml-1" />
      )
    ) : (
      <ChevronUp size={12} className="inline ml-1 opacity-20" />
    );

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const executeAction = async () => {
    const { user, type } = confirmConfig;
    if (!user?._id) return;

    setIsActionLoading(true);
    try {
      if (type === "lock") {
        await userService.lockUser(user._id);
        toast.success(`Đã khóa tài khoản ${user.name}`);
      } else if (type === "delete") {
        await userService.deleteUser(user._id);
        toast.success(`Đã xóa tài khoản ${user.name}`);
      }
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    } finally {
      setIsActionLoading(false);
      setConfirmConfig((prev) => ({ ...prev, open: false }));
    }
  };

  const handleUnlock = async (user) => {
    try {
      await userService.unlockUser(user._id);
      toast.success(`Đã mở khóa tài khoản ${user.name}`);
      fetchUsers();
    } catch {
      toast.error("Mở khóa thất bại");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-10">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-lg bg-muted animate-pulse"
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead
                className="cursor-pointer select-none font-semibold"
                onClick={() => toggleSort("name")}
              >
                Người dùng <SortIcon col="name" />
              </TableHead>
              <TableHead className="font-semibold">Liên hệ</TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold"
                onClick={() => toggleSort("role")}
              >
                Vai trò <SortIcon col="role" />
              </TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="text-right font-semibold">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-32 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <User size={32} className="opacity-20" />
                    <span>Không tìm thấy người dùng nào phù hợp.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user._id}
                  className="group transition-colors hover:bg-muted/30"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
                        <AvatarImage src={user.avatar?.url} alt={user.name} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-sm">
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium leading-tight">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {user._id?.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">{user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.addreses?.[0]?.phone || "Chưa cập nhật"}
                    </div>
                  </TableCell>

                  <TableCell>
                    {user.role === "admin" ? (
                      <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border border-violet-200 gap-1 font-medium">
                        <ShieldCheck size={11} /> Admin
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground gap-1 font-medium"
                      >
                        <User size={11} /> User
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={user.isActive ? "outline" : "destructive"}
                      className={
                        user.isActive
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-200 font-medium"
                          : "font-medium"
                      }
                    >
                      <span
                        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                          user.isActive ? "bg-emerald-500" : "bg-red-400"
                        }`}
                      />
                      {user.isActive ? "Hoạt động" : "Đã khóa"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                          Hành động cho {user.name}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleEdit(user)}
                          className="cursor-pointer"
                        >
                          <UserCog className="mr-2 text-blue-500" size={15} />
                          Sửa thông tin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.isActive ? (
                          <DropdownMenuItem
                            className="text-amber-600 cursor-pointer focus:text-amber-700 focus:bg-amber-50"
                            onClick={() =>
                              setConfirmConfig({
                                open: true,
                                user,
                                type: "lock",
                              })
                            }
                          >
                            <Lock className="mr-2" size={15} /> Khóa tài khoản
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-emerald-600 cursor-pointer focus:text-emerald-700 focus:bg-emerald-50"
                            onClick={() => handleUnlock(user)}
                          >
                            <Unlock className="mr-2" size={15} /> Mở khóa
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer focus:bg-red-50"
                          onClick={() =>
                            setConfirmConfig({
                              open: true,
                              user,
                              type: "delete",
                            })
                          }
                        >
                          <Trash2 className="mr-2" size={15} /> Xóa vĩnh viễn
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filteredUsers.length > 0 && (
          <div className="border-t px-4 py-2.5 bg-muted/20 text-xs text-muted-foreground flex justify-between items-center">
            <span>
              Hiển thị{" "}
              <strong className="text-foreground">
                {filteredUsers.length}
              </strong>{" "}
              / {users.length} người dùng
            </span>
            <span>
              {users.filter((u) => u.isActive).length} đang hoạt động ·{" "}
              {users.filter((u) => !u.isActive).length} bị khóa
            </span>
          </div>
        )}
      </div>

      <UserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      <ConfirmActionDialog
        open={confirmConfig.open}
        onOpenChange={(open) => setConfirmConfig((prev) => ({ ...prev, open }))}
        userName={confirmConfig.user?.name}
        type={confirmConfig.type}
        onConfirm={executeAction}
        isLoading={isActionLoading}
      />
    </>
  );
}
