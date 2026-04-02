export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      {/* cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="h-32 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
           <div className="w-12 h-2 bg-gray-200 mb-4"></div>
           <div className="w-20 h-8 bg-gray-300"></div>
        </div>
        <div className="h-32 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
           <div className="w-12 h-2 bg-gray-200 mb-4"></div>
           <div className="w-20 h-8 bg-gray-300"></div>
        </div>
        <div className="h-32 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
           <div className="w-12 h-2 bg-gray-200 mb-4"></div>
           <div className="w-20 h-8 bg-gray-300"></div>
        </div>
        <div className="h-32 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
           <div className="w-12 h-2 bg-gray-200 mb-4"></div>
           <div className="w-20 h-8 bg-gray-300"></div>
        </div>
      </div>

      {/* chart */}
      <div className="h-96 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 italic">
        [ Khu vực biểu đồ doanh thu ]
      </div>
    </div>
  )
}