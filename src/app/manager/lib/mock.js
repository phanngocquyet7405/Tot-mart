export const products = [
  { id: "p1", name: "Mật ong hoa cà phê", brand: "Mộc Nhiên", category: "Thực phẩm", price: 185000, stock: 24, updated: "12/10/2026", image: "https://images.unsplash.com/photo-1587049352846-4a222e784720?auto=format&fit=crop&w=120&q=80" },
  { id: "p2", name: "Trà ô long rang mộc", brand: "Đồi Gió", category: "Đồ uống", price: 145000, stock: 8, updated: "11/10/2026", image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=120&q=80" },
  { id: "p3", name: "Hạt điều rang muối", brand: "Nhà Hạt", category: "Thực phẩm", price: 99000, stock: 0, updated: "08/10/2026", image: "https://images.unsplash.com/photo-1536591375667-0f7e8f4f0f1f?auto=format&fit=crop&w=120&q=80" },
  { id: "p4", name: "Nến thơm gỗ tuyết tùng", brand: "Bếp Nhỏ", category: "Nhà cửa", price: 260000, stock: 31, updated: "07/10/2026", image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=120&q=80" },
  { id: "p5", name: "Dầu gội bồ kết", brand: "Lành", category: "Chăm sóc", price: 168000, stock: 5, updated: "05/10/2026", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=120&q=80" },
]

export const combos = [
  { id: "c1", name: "Vị ngọt cao nguyên", items: 3, value: 429000, discount: 10, stock: 12, until: "31/12/2026", status: "Đang bán", image: products[0].image },
  { id: "c2", name: "Chậm lại một chút", items: 4, value: 698000, discount: 15, stock: 4, until: "20/10/2026", status: "Đang bán", image: products[1].image },
  { id: "c3", name: "Góc nhỏ bình yên", items: 2, value: 356000, discount: 8, stock: 0, until: "30/09/2026", status: "Hết hạn", image: products[3].image },
]

export const orders = [
  { id: "TM-20261014-028", date: "14/10/2026", city: "Hồ Chí Minh", items: 4, total: 684000, method: "Online", payment: "Đã thanh toán", status: "Đang giao" },
  { id: "TM-20261014-027", date: "14/10/2026", city: "Hà Nội", items: 2, total: 329000, method: "COD", payment: "Chờ thanh toán", status: "Chờ xử lý" },
  { id: "TM-20261013-026", date: "13/10/2026", city: "Đà Nẵng", items: 6, total: 1125000, method: "Online", payment: "Đã thanh toán", status: "Đang xử lý" },
  { id: "TM-20261012-025", date: "12/10/2026", city: "Cần Thơ", items: 1, total: 185000, method: "COD", payment: "Đã thanh toán", status: "Đã giao" },
]

export const getStats = () => ({ products: products.length, lowStock: products.filter((item) => item.stock > 0 && item.stock <= 10).length, activeCombos: combos.filter((item) => item.status === "Đang bán").length, awaiting: orders.filter((item) => item.status === "Chờ xử lý").length })
export const formatVND = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value)
export const getStockState = (stock) => stock === 0 ? "out" : stock <= 10 ? "low" : "good"
export const getList = (section) => section === "combos" ? combos : section === "orders" ? orders : products
export const getSectionMeta = (section) => ({ products: { title: "Sản phẩm", description: "Quản lý danh mục sản phẩm và tồn kho của gian hàng.", action: "Tạo sản phẩm" }, combos: { title: "Combo", description: "Tạo những lựa chọn được tuyển chọn cho khách hàng.", action: "Tạo combo" }, gifts: { title: "Hộp quà", description: "Đóng gói những món quà có câu chuyện riêng.", action: "Tạo hộp quà" }, subscriptions: { title: "Đăng ký hàng tháng", description: "Quản lý các gói giao hàng định kỳ.", action: "Tạo gói đăng ký" }, orders: { title: "Đơn hàng", description: "Theo dõi và xử lý đơn hàng của gian hàng.", action: null } })[section] || { title: "Tổng quan", description: "Một góc nhìn rõ ràng về gian hàng của bạn.", action: null }

export const fetchProducts = async () => products
export const fetchCombos = async () => combos
export const fetchOrders = async () => orders
export const fetchStats = async () => getStats()
export const navItems = [
  { key: "products", label: "Sản phẩm", icon: "Package" },
  { key: "combos", label: "Combo", icon: "Layers3" },
  { key: "gifts", label: "Hộp quà", icon: "Gift" },
  { key: "subscriptions", label: "Đăng ký hàng tháng", icon: "RefreshCcw" },
  { key: "orders", label: "Đơn hàng", icon: "ClipboardList" },
]

export const orderDetails = { address: "42 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh", items: [{ name: "Mật ong hoa cà phê", quantity: 1, price: 185000 }, { name: "Trà ô long rang mộc", quantity: 2, price: 145000 }, { name: "Nến thơm gỗ tuyết tùng", quantity: 1, price: 260000 }] }

export const sectionLabels = { products: ["Tên sản phẩm", "Thương hiệu", "Danh mục", "Giá bán", "Tồn kho", "Cập nhật"], combos: ["Tên combo", "Số sản phẩm", "Giá trị", "Giảm giá", "Tồn kho", "Kết thúc", "Trạng thái"], orders: ["Mã đơn", "Ngày đặt", "Thành phố", "Sản phẩm", "Tổng tiền", "Thanh toán", "Trạng thái"] }

export const alertItems = [{ title: "Hạt điều rang muối", detail: "Đã hết hàng", tone: "out" }, { title: "Trà ô long rang mộc", detail: "Chỉ còn 8 sản phẩm", tone: "low" }, { title: "Chậm lại một chút", detail: "Hết hạn trong 5 ngày", tone: "low" }]

export const emptyStateCopy = { gifts: { title: "Chưa có hộp quà", description: "Tạo hộp quà từ một combo đang bán để bắt đầu.", action: "Tạo hộp quà" }, subscriptions: { title: "Chưa có gói đăng ký", description: "Mời khách hàng quay lại mỗi tháng với một lựa chọn thật riêng.", action: "Tạo gói đăng ký" } }

export const getToday = () => "Thứ Tư, 15 tháng 10, 2026"

export const statusTone = (status) => ({ "Đang bán": "success", "Đã giao": "success", "Đã thanh toán": "success", "Đang giao": "info", "Đang xử lý": "info", "Chờ xử lý": "warning", "Chờ thanh toán": "warning", "Hết hạn": "muted", "Đã khoá": "danger", "Đã huỷ": "danger" })[status] || "muted"

export const giftRows = []
export const subscriptionRows = []

export const overviewCards = [
  { key: "products", label: "Tổng sản phẩm", delta: "+2 tháng này", tone: "green" },
  { key: "lowStock", label: "Sắp hết hàng", delta: "Cần xử lý sớm", tone: "amber" },
  { key: "activeCombos", label: "Combo đang bán", delta: "2 combo hoạt động", tone: "terracotta" },
  { key: "awaiting", label: "Chờ giao hàng", delta: "Cần xử lý hôm nay", tone: "blue" },
]

export const chartData = [42, 56, 45, 74, 62, 84, 78]
