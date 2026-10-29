"use client";

import { Home, ShoppingBag, UserCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProfileTabs({ profileContent, addressContent, cartContent }) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-3 gap-1 sm:gap-2 bg-muted/60 p-1.5 rounded-2xl border border-border">
        <TabsTrigger
          value="profile"
          className="min-h-11 rounded-xl text-xs sm:text-sm font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground transition-all"
        >
          <UserCircle className="mr-1.5 sm:mr-2 h-4 w-4" />
          Thông tin cá nhân
        </TabsTrigger>
        <TabsTrigger
          value="addresses"
          className="min-h-11 rounded-xl text-xs sm:text-sm font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground transition-all"
        >
          <Home className="mr-1.5 sm:mr-2 h-4 w-4" />
          Sổ địa chỉ
        </TabsTrigger>
        <TabsTrigger
          value="cart"
          className="min-h-11 rounded-xl text-xs sm:text-sm font-bold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground transition-all"
        >
          <ShoppingBag className="mr-1.5 sm:mr-2 h-4 w-4" />
          Giỏ hàng
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-5">
        {profileContent}
      </TabsContent>
      <TabsContent value="addresses" className="mt-5">
        {addressContent}
      </TabsContent>
      <TabsContent value="cart" className="mt-5">
        {cartContent}
      </TabsContent>
    </Tabs>
  );
}
