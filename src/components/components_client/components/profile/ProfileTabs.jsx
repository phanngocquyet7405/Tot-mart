"use client";

import { Home, ShoppingBag, UserCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProfileTabs({ profileContent, addressContent, cartContent }) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-3 gap-2 bg-emerald-50 p-2">
        <TabsTrigger
          value="profile"
          className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
        >
          <UserCircle className="mr-2 h-4 w-4" />
          Profile Info
        </TabsTrigger>
        <TabsTrigger
          value="addresses"
          className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
        >
          <Home className="mr-2 h-4 w-4" />
          Addresses
        </TabsTrigger>
        <TabsTrigger
          value="cart"
          className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Cart
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-4">
        {profileContent}
      </TabsContent>
      <TabsContent value="addresses" className="mt-4">
        {addressContent}
      </TabsContent>
      <TabsContent value="cart" className="mt-4">
        {cartContent}
      </TabsContent>
    </Tabs>
  );
}
