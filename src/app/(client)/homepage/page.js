'use client';

import NavMenu from "../components/nav_menu";
import AnnouncementBar from "../components/AnnouncementBar";
import MainHeader from "../components/main_header";
import HeroSection from "../components/hero_section";
import FeaturedProducts from "../components/product/featured_products";
import Footer from "../components/footer";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="sticky top-0 bg-white shadow-sm z-1000">
                <AnnouncementBar />
                <MainHeader />
                <NavMenu/>
            </div>

            {/* Hero Section */}
            <HeroSection />

            {/* Featured Products */}
            <FeaturedProducts/>

            {/* Footer */}
            <Footer/>
        </div>
    );
}