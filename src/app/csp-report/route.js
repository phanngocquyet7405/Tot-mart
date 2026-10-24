import { NextResponse } from "next/server.js";
import logger from "../util/Logger.js";

/**
 * CSP Report Endpoint — /csp-report
 *
 * Tiêu chí kỹ thuật (Phase F-FIX):
 * - Độc lập hoàn toàn với rewrite /api/:path* do nằm tại /csp-report.
 * - Chỉ bật nhận báo cáo ở test/staging (Report-Only).
 * - Giới hạn kích thước body ~8KB (8192 bytes) để chống DoS.
 * - Cắt query string khỏi mọi URL trong report để bảo vệ quyền riêng tư và PII.
 * - TUYỆT ĐỐI KHÔNG GHI ĐĨA (không dùng fs write).
 * - Đếm thống kê trong bộ nhớ (in-memory counter) và chuyển tiếp qua logger phân cấp có lọc.
 */

const MAX_BODY_BYTES = 8192; // 8KB limit

// Bộ đếm thống kê sự cố CSP trong bộ nhớ (In-memory aggregation)
const cspStats = {
  totalReports: 0,
  byDirective: {},
  lastReportTime: null,
};

/**
 * Trả về thống kê CSP hiện tại (phục vụ kiểm thử hoặc giám sát).
 */
export function getCspStatistics() {
  return { ...cspStats, byDirective: { ...cspStats.byDirective } };
}

/**
 * Đặt lại bộ đếm thống kê (phục vụ test).
 */
export function resetCspStatistics() {
  cspStats.totalReports = 0;
  cspStats.byDirective = {};
  cspStats.lastReportTime = null;
}

/**
 * Cắt bỏ query string và hash khỏi URL để ngăn rò rỉ token hoặc tham số nhạy cảm.
 * @param {string} rawUrl
 * @returns {string}
 */
export function sanitizeReportUrl(rawUrl) {
  if (typeof rawUrl !== "string" || !rawUrl) return "";
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    // Nếu không parse được dạng URL đầy đủ, cắt chuỗi trước ký tự '?' hoặc '#'
    return rawUrl.split("?")[0].split("#")[0];
  }
}

export async function POST(request) {
  try {
    // Kiểm tra kích thước header Content-Length trước
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Payload Too Large: CSP report exceeds 8KB limit" },
        { status: 413 },
      );
    }

    // Đọc body dạng text có kiểm soát kích thước
    const bodyText = await request.text();
    if (bodyText.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Payload Too Large: CSP report exceeds 8KB limit" },
        { status: 413 },
      );
    }

    if (!bodyText || bodyText.trim().length === 0) {
      return NextResponse.json({ ok: true, message: "Empty report ignored" }, { status: 200 });
    }

    let reportJson = {};
    try {
      reportJson = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Tiêu chuẩn CSP report: { "csp-report": { "effective-directive": "...", ... } }
    // hoặc standard Reporting API: [{ "type": "csp-violation", "body": { ... } }]
    const cspReport =
      reportJson["csp-report"] ||
      (Array.isArray(reportJson) && reportJson[0]?.body) ||
      reportJson;

    const directive =
      cspReport["effective-directive"] ||
      cspReport["violated-directive"] ||
      "unknown-directive";

    const documentUri = sanitizeReportUrl(cspReport["document-uri"]);
    const blockedUri = sanitizeReportUrl(cspReport["blocked-uri"]);

    // Cập nhật thống kê trong bộ nhớ
    cspStats.totalReports += 1;
    cspStats.byDirective[directive] = (cspStats.byDirective[directive] || 0) + 1;
    cspStats.lastReportTime = new Date().toISOString();

    // Ghi log qua logger có phân cấp và lọc dữ liệu (KHÔNG GHI ĐĨA)
    logger.warn(
      `[CSP-Report] Violation detected: directive=${directive}, document=${documentUri}, blocked=${blockedUri}`,
    );

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    logger.error("[CSP-Report] Error processing CSP report:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
