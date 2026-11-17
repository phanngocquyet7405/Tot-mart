import logger from "@/app/util/Logger";
import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        logger.log("Searching for:", searchQuery);
    };

    return (
        <form onSubmit={handleSearch} className="w-full max-w-2xl">
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="search something"
                    className="w-full py-2.5 px-4 pr-12 rounded-full border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                />
                <button 
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-muted transition-colors duration-200"
                    aria-label="Search"
                >
                    <Search className="w-5 h-5 text-muted-foreground"/>
                </button>
            </div>
        </form>
    );
}