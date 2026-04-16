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
} from "lucide-react"; // Thêm icon Role
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
    } catch (error) {
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
    if (!q) return users;

    return users.filter((user) => {
      const name = (user.fullName || user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const role = (user.role || "").toLowerCase(); // Lấy role để lọc
      const phone =
        user.phone ||
        user.addresses?.[0]?.phone ||
        user.addreses?.[0]?.phone ||
        "";

      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        role.includes(q)
      );
    });
  }, [users, search]);

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
        toast.success(`Đã khóa tài khoản ${user.fullName || user.name}`);
      } else if (type === "delete") {
        await userService.deleteUser(user._id);
        toast.success(`Đã xóa tài khoản ${user.fullName || user.name}`);
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
      toast.success(`Đã mở khóa tài khoản ${user.fullName || user.name}`);
      fetchUsers();
    } catch (error) {
      toast.error("Mở khóa thất bại");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground">
        <div className="animate-pulse">Đang tải dữ liệu người dùng...</div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Vai trò</TableHead> {/* Thêm cột Vai trò */}
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5} // Tăng lên 5
                  className="text-center h-24 text-muted-foreground"
                >
                  Không tìm thấy người dùng nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.fullName} />
                        <AvatarFallback>
                          {(user.fullName || user.name || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {user.fullName || user.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.phone ||
                        user.addresses?.[0]?.phone ||
                        "Chưa cập nhật"}
                    </div>
                  </TableCell>
                  {/* Cột Vai trò mới */}
                  <TableCell>
                    {user.role === "admin" ? (
                      <Badge
                        variant="secondary"
                        className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-violet-200 gap-1"
                      >
                        <ShieldCheck size={12} /> Admin
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground gap-1"
                      >
                        <User size={12} /> user
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "outline" : "destructive"
                      }
                      className={
                        user.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                          : ""
                      }
                    >
                      {user.status === "active" ? "Hoạt động" : "Đã khóa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEdit(user)}
                          className="cursor-pointer"
                        >
                          <UserCog className="mr-2 text-blue-500" size={16} />
                          Sửa thông tin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === "active" ? (
                          <DropdownMenuItem
                            className="text-amber-600 cursor-pointer"
                            onClick={() =>
                              setConfirmConfig({
                                open: true,
                                user,
                                type: "lock",
                              })
                            }
                          >
                            <Lock className="mr-2" size={16} /> Khóa tài khoản
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-emerald-600 cursor-pointer"
                            onClick={() => handleUnlock(user)}
                          >
                            <Unlock className="mr-2" size={16} /> Mở khóa
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() =>
                            setConfirmConfig({
                              open: true,
                              user,
                              type: "delete",
                            })
                          }
                        >
                          <Trash2 className="mr-2" size={16} /> Xóa vĩnh viễn
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
        userName={confirmConfig.user?.fullName || confirmConfig.user?.name}
        type={confirmConfig.type}
        onConfirm={executeAction}
        isLoading={isActionLoading}
      />
    </>
  );
}
