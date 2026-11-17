"use client";

import { Home, ShoppingBag, UserCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProfileTabs({ profileContent, addressContent, cartContent }) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-1 sm:grid-cols-3 h-auto w-full gap-1.5 sm:gap-2 bg-muted/60 p-1.5 rounded-2xl border border-border">
        <TabsTrigger
          value="profile"
          className="min-h-11 h-auto py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center text-center leading-tight whitespace-normal data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground transition-all"
        >
          <UserCircle className="mr-2 h-4 w-4 shrink-0" />
          <span>Thông tin cá nhân</span>
        </TabsTrigger>
        <TabsTrigger
          value="addresses"
          className="min-h-11 h-auto py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center text-center leading-tight whitespace-normal data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground transition-all"
        >
          <Home className="mr-2 h-4 w-4 shrink-0" />
          <span>Sổ địa chỉ</span>
        </TabsTrigger>
        <TabsTrigger
          value="cart"
          className="min-h-11 h-auto py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center text-center leading-tight whitespace-normal data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground transition-all"
        >
          <ShoppingBag className="mr-2 h-4 w-4 shrink-0" />
          <span>Giỏ hàng</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6">
        {profileContent}
      </TabsContent>
      <TabsContent value="addresses" className="mt-6">
        {addressContent}
      </TabsContent>
      <TabsContent value="cart" className="mt-6">
        {cartContent}
      </TabsContent>
    </Tabs>
  );
}
