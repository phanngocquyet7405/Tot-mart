export default function AnnouncementBar() {
  return (
    <div className="w-full bg-[#0F172A] py-2 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-white text-sm">
          Limited Gifts Available –{' '}
          <a
            href="#promo"
            className="underline hover:text-gray-200 transition-colors duration-200"
          >
            Use Code TotBox10 for 10% Off Your First Order!
          </a>
        </p>
      </div>
    </div>
  );
}