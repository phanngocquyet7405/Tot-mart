"use client";

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
import { Card, CardContent } from "@/components/ui/card";
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
import { useAdminUsersTable } from "../../admin-users/hooks/useAdminUsersTable";

function SortIcon({ sortConfig, col }) {
  return sortConfig.key === col ? (
    sortConfig.dir === "asc" ? (
      <ChevronUp size={12} className="inline ml-1" />
    ) : (
      <ChevronDown size={12} className="inline ml-1" />
    )
  ) : (
    <ChevronUp size={12} className="inline ml-1 opacity-20" />
  );
}

export default function UserTable({ search, refreshTrigger }) {
  const {
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
  } = useAdminUsersTable({ search, refreshTrigger });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-6">
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
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Mobile Card View (< 768px) */}
        <div className="md:hidden divide-y divide-border">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 px-4 text-muted-foreground">
              <User size={32} className="mx-auto mb-2 opacity-30 text-muted-foreground" />
              <p className="text-sm">Không tìm thấy người dùng nào phù hợp.</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user._id} className="rounded-none border-x-0 border-t-0 shadow-none">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm shrink-0">
                        <AvatarImage src={user.avatar?.url} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="min-h-11 min-w-11 shrink-0 -mr-2 -mt-2 text-muted-foreground"
                        >
                          <MoreHorizontal size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                          Hành động cho {user.name}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleEdit(user)}
                          className="cursor-pointer min-h-11 flex items-center"
                        >
                          <UserCog className="mr-2 text-primary" size={15} />
                          Sửa thông tin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.isActive ? (
                          <DropdownMenuItem
                            className="text-warning-text cursor-pointer min-h-11 flex items-center focus:text-warning-text focus:bg-warning/10"
                            onClick={() => requestAction(user, "lock")}
                          >
                            <Lock className="mr-2" size={15} /> Khóa tài khoản
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-success-text cursor-pointer min-h-11 flex items-center focus:text-success-text focus:bg-success/10"
                            onClick={() => handleUnlock(user)}
                          >
                            <Unlock className="mr-2" size={15} /> Mở khóa
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive-text focus:text-destructive-text cursor-pointer min-h-11 flex items-center focus:bg-destructive/10"
                          onClick={() => requestAction(user, "delete")}
                        >
                          <Trash2 className="mr-2" size={15} /> Xóa vĩnh viễn
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-2">
                      {user.role === "admin" ? (
                        <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border border-primary/20 gap-1 font-medium text-[11px]">
                          <ShieldCheck size={11} /> Admin
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground gap-1 font-medium text-[11px]"
                        >
                          <User size={11} /> User
                        </Badge>
                      )}

                      <Badge
                        variant="outline"
                        className={
                          user.isActive
                            ? "bg-success/15 text-success-text border-success/20 font-medium text-[11px]"
                            : "bg-destructive/15 text-destructive-text border-destructive/20 font-medium text-[11px]"
                        }
                      >
                        <span
                          className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${
                            user.isActive ? "bg-success" : "bg-destructive"
                          }`}
                        />
                        {user.isActive ? "Hoạt động" : "Đã khóa"}
                      </Badge>
                    </div>

                    <span className="text-muted-foreground tabular-nums">
                      {user.addresses?.[0]?.phone || "ID: " + user._id?.slice(-6)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Desktop Table View (>= 768px) */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead
                  className="cursor-pointer select-none font-semibold"
                  onClick={() => toggleSort("name")}
                >
                  Người dùng <SortIcon sortConfig={sortConfig} col="name" />
                </TableHead>
                <TableHead className="font-semibold">Liên hệ</TableHead>
                <TableHead
                  className="cursor-pointer select-none font-semibold"
                  onClick={() => toggleSort("role")}
                >
                  Vai trò <SortIcon sortConfig={sortConfig} col="role" />
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
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                            {(user.name || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium leading-tight">{user.name}</p>
                          <p className="text-xs text-muted-foreground tabular-nums">
                            ID: {user._id?.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">{user.email}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {user.addresses?.[0]?.phone || "Chưa cập nhật"}
                      </div>
                    </TableCell>

                    <TableCell>
                      {user.role === "admin" ? (
                        <Badge className="bg-primary/15 text-primary hover:bg-primary/15 border border-primary/20 gap-1 font-medium">
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
                        variant="outline"
                        className={
                          user.isActive
                            ? "bg-success/15 text-success-text border-success/20 font-medium"
                            : "bg-destructive/15 text-destructive-text border-destructive/20 font-medium"
                        }
                      >
                        <span
                          className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                            user.isActive ? "bg-success" : "bg-destructive"
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
                            className="h-8 w-8 pointer-coarse:min-h-11 pointer-coarse:min-w-11 opacity-0 group-hover:opacity-100 transition-opacity"
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
                            className="cursor-pointer pointer-coarse:min-h-11 flex items-center"
                          >
                            <UserCog className="mr-2 text-primary" size={15} />
                            Sửa thông tin
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.isActive ? (
                            <DropdownMenuItem
                              className="text-warning-text cursor-pointer pointer-coarse:min-h-11 flex items-center focus:text-warning-text focus:bg-warning/10"
                              onClick={() => requestAction(user, "lock")}
                            >
                              <Lock className="mr-2" size={15} /> Khóa tài khoản
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-success-text cursor-pointer pointer-coarse:min-h-11 flex items-center focus:text-success-text focus:bg-success/10"
                              onClick={() => handleUnlock(user)}
                            >
                              <Unlock className="mr-2" size={15} /> Mở khóa
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive-text focus:text-destructive-text cursor-pointer pointer-coarse:min-h-11 flex items-center focus:bg-destructive/10"
                            onClick={() => requestAction(user, "delete")}
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
        </div>

        {filteredUsers.length > 0 && (
          <div className="border-t border-border px-4 py-2.5 bg-muted/20 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span>
              Hiển thị{" "}
              <strong className="text-foreground tabular-nums">
                {filteredUsers.length}
              </strong>{" "}
              / <span className="tabular-nums">{users.length}</span> người dùng
            </span>
            <span className="tabular-nums">
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
