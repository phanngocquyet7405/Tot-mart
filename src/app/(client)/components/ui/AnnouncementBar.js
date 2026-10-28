export default function AnnouncementBar() {
  return (
    <div className="w-full bg-foreground py-2 px-4 text-background">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm font-medium">
          Chào mừng đến với TotBox –{" "}
          <a
            href="#promo"
            className="underline hover:opacity-90 transition-opacity"
          >
            Khám phá khuyến mãi mới nhất và ưu đãi độc quyền!
          </a>
        </p>
      </div>
    </div>
  );
}
