'use client'
import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import CartItem from "./cart_item"
import CategoryItem from "../Category_component/category_item"

export default function CartDrawer({ open, setOpen }) {
  const products = [
    { name: "Mystery Pack", price: 19.99, old: 29.99, image: "/assets/product1.png" },
    { name: "Snack Attack", price: 29.99, image: "/assets/product2.png" },
    { name: "Strawberry Milk", price: 3.99, image: "/assets/product3.png" },
    // ... các sản phẩm khác của bạn
  ];

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-1001"
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full md:w-2/3 bg-[#f6f2ea] z-1002 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-gray-200 bg-white shrink-0">
              <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Nội dung chính */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              
              {/* CỘT TRÁI: Customers Also Loved */}
              <div className="w-full md:w-1/2 p-8 border-r border-gray-200 overflow-y-auto bg-white/50">
                <h3 className="text-xl font-bold mb-6 text-gray-800">Customers Also Loved</h3>
                <div className="space-y-4">
                  {products.map((p, i) => (
                    <CartItem key={i} product={p} />
                  ))}
                </div>
              </div>

              {/* CỘT PHẢI: Popular Categories & Discover Button */}
              <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-[#fdfbf7]">
                <div className="mb-10 text-center md:text-left h-full flex flex-col">
                    <p className="text-gray-500 font-medium italic mb-8">Your cart is currently empty.</p>
                    
                    <h3 className="text-xl font-bold mb-6 text-gray-800">Popular Categories</h3>
                    
                    <div className="space-y-3 mb-10">
                        <CategoryItem label="Sweets" />
                        <CategoryItem label="Snacks" />
                        <CategoryItem label="Drinks" />
                    </div>

                    <div className="mt-auto md:mt-0">
                        <button className="bg-[#1a4d2e] text-white py-4 rounded-xl w-full font-bold shadow-lg hover:bg-[#143d24] transition-all active:scale-[0.98]">
                            DISCOVER MORE
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Free shipping on orders over $50
                        </p>
                    </div>
                </div>
              </div>
            </div>

            {/* Footer sau thêm tổng tiền) */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0 flex justify-center items-center">
               <span className="text-gray-400 text-sm">TotMart - Quality Selection</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}