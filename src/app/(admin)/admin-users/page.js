"use client";

import { useState } from "react";
import { Users, Search, RefreshCw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminPageHeader } from "../components/shared";
import UserTable from "../components/users/UserTable";
import UserDialog from "../components/users/UserDialog";

export default function UsersManagement() {
  const [search, setSearch] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Admin: Xem, khóa và quản lý tài khoản"
        icon={Users}
        actions={
          <Button className="gap-2 min-h-11" onClick={() => setIsAddUserOpen(true)}>
            <UserPlus size={16} /> Thêm người dùng
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                className="pl-9 min-h-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2 min-h-11"
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
              Làm mới
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <UserTable search={search} refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>

      <UserDialog
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
