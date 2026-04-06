'use client';

import Link from "next/link";

import NavMenu from "../components/nav_menu";
import AnnouncementBar from "../components/AnnouncementBar";
import MainHeader from "../components/main_header";
import HeroSection from "../components/hero_section_page/hero_section";
import FeaturedProducts from "../components/product/featured_products";
import Footer from "../components/footer";

import { MOCK_PRODUCTS } from "@/app/data_clone/mockProducts";
import TotmartLanding from "../components/totmart_landing";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="sticky top-0 bg-white shadow-sm z-1000">
                <AnnouncementBar />
                <MainHeader />
                <Link href="/products" className="block hover:opacity-90 transition-opacity">
                    <div className="cursor-pointer">
                        <NavMenu />
                    </div>
                </Link>
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