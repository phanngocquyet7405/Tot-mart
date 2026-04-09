'use client';

import Link from "next/link";

import NavMenu from "../components/ui/nav_menu";
import AnnouncementBar from "../components/ui/AnnouncementBar";
import MainHeader from "../components/ui/main_header";
import HeroSection from "../components/hero_section_page/hero_section";
import FeaturedProducts from "../components/layout/product/featured_products";
import Footer from "../components/ui/footer";

import { MOCK_PRODUCTS } from "@/app/data_clone/mockProducts";
import TotmartLanding from "../components/layout/totmart_landing";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="sticky top-0 bg-white shadow-sm z-1000">
                <AnnouncementBar />
                <MainHeader />
                    <div className="cursor-pointer">
                        <NavMenu />
                    </div>
            </div>

            {/* Hero Section */}
            <HeroSection />

            {/* Featured Products */}
            <FeaturedProducts 
            title="CA THE VUOT TROI"
            initialData={MOCK_PRODUCTS}
            />

            <FeaturedProducts
            title="New Arrials"
            initialData={MOCK_PRODUCTS.slice(0,5)}
            />

            {/* Totmart Landing */}
            <div className="pt-10 bg-white">
                <TotmartLanding/>
            </div>
            
            {/* Footer */}
            <Footer/>
        </div>
    );
}