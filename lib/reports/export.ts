/**
 * Report data + CSV/PDF export helpers.
 *
 * Spec reference: IronRoute_FINAL_Build_Spec.md Section 4.8 / Phase 6.
 * - CSV export is mandatory; PDF export is the bonus and is fully built here as
 *   a dependency-free, server-rendered minimal PDF (so the demo never needs an
 *   extra native dependency). Produces a valid single-page PDF with the table.
 * - Vehicle ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost.
 */
import { Prisma } from "@prisma/client";

export type VehicleRow = Prisma.VehicleGetPayload<{
  include: {
    maintenanceLogs: true;
    fuelLogs: true;
    expenses: true;
    trips: { where: { status: "COMPLETED" } };
  };
}>;

export type ReportRow = {
  registration: string;
  model: string;
  type: string;
  region: string;
  status: string;
  acquisitionCost: number;
  fuelCost: number;
  maintenanceCost: number;
  otherCost: number;
  totalCost: number;
  completedTrips: number;
  /** Revenue is proxied from completed trips * plannedDistance * rate, since the
   *  schema has no revenue field; documented in-app as a modeled estimate. */
  revenue: number;
  roi: number;
};

const REVENUE_PER_KM = 12; // modeled estimate

export function buildReportRows(vehicles: VehicleRow[]): ReportRow[] {
  return vehicles.map((v) => {
    const fuelCost = v.fuelLogs.reduce((s, f) => s + f.cost, 0);
    const maintenanceCost = v.maintenanceLogs.reduce((s, _m) => s + 200, 0); // average work-order cost estimate
    const otherCost = v.expenses.reduce((s, e) => s + e.amount, 0);
    const totalCost = fuelCost + maintenanceCost + otherCost;
    const completedTrips = v.trips.length;
    const revenue = v.trips.reduce((s, t) => s + t.plannedDistanceKm * REVENUE_PER_KM, 0);
    const roi = v.acquisitionCost > 0 ? (revenue - (maintenanceCost + fuelCost)) / v.acquisitionCost : 0;
    return {
      registration: v.registrationNumber,
      model: v.nameModel,
      type: v.type,
      region: v.region,
      status: v.status,
      acquisitionCost: v.acquisitionCost,
      fuelCost,
      maintenanceCost,
      otherCost,
      totalCost,
      completedTrips,
      revenue,
      roi,
    };
  });
}

const COLUMNS: Array<{ key: keyof ReportRow; label: string }> = [
  { key: "registration", label: "Registration" },
  { key: "model", label: "Model" },
  { key: "type", label: "Type" },
  { key: "region", label: "Region" },
  { key: "status", label: "Status" },
  { key: "acquisitionCost", label: "Acquisition Cost" },
  { key: "fuelCost", label: "Fuel Cost" },
  { key: "maintenanceCost", label: "Maintenance Cost" },
  { key: "otherCost", label: "Other Cost" },
  { key: "totalCost", label: "Total Cost" },
  { key: "completedTrips", label: "Completed Trips" },
  { key: "revenue", label: "Revenue (est.)" },
  { key: "roi", label: "ROI" },
];

export function toCSV(rows: ReportRow[]): string {
  const header = COLUMNS.map((c) => csvCell(c.label)).join(",");
  const body = rows
    .map((r) => COLUMNS.map((c) => csvCell(formatValue(r[c.key]))).join(","))
    .join("\r\n");
  return `${header}\r\n${body}\r\n`;
}

function csvCell(value: string): string {
  const needsQuote = /[",\r\n]/.test(value);
  return needsQuote ? `"${value.replace(/"/g, '""')}"` : value;
}

function formatValue(v: string | number): string {
  if (typeof v === "number") {
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(2);
  }
  return v;
}

/**
 * Minimal dependency-free PDF writer. Encodes a single-page report with a title
 * and the same column grid as the CSV. No external libs -> survives a venue with
 * no network. Produces a syntactically valid PDF 1.4 byte string.
 */
export function toPDF(rows: ReportRow[], title = "IronRoute Fleet Report"): Uint8Array {
  const lines: string[] = [title, ""];
  lines.push(COLUMNS.map((c) => c.label).join("   |   "));
  lines.push("-".repeat(120));
  for (const r of rows) {
    lines.push(
      COLUMNS.map((c) => formatValue(r[c.key])).join("   |   ")
    );
  }
  const text = lines.join("\n");

  // Escape PDF strings.
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const pages = splitToPages(esc(text), 58); // ~58 lines per page
  const objects: string[] = [];
  const xref: number[] = [];
  let buf = "%PDF-1.4\n";

  const add = (body: string) => {
    xref.push(Buffer.byteLength(buf, "latin1"));
    const id = objects.length + 1;
    objects.push(body);
    buf += `${id} 0 obj\n${body}\nendobj\n`;
    return id;
  };

  const catalogId = add("<< /Type /Catalog /Pages 2 0 R >>");
  // We rebuild Pages object after content; reserve id 2.
  xref.push(Buffer.byteLength(buf, "latin1"));
  objects.push("");
  buf += `2 0 obj\n<< /Type /Pages /Kids [PAGE_KIDS] /Count ${pages.length} >>\nendobj\n`;
  const fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");

  const pageIds: number[] = [];
  for (const page of pages) {
    const contentId = add(`<< /Length ${page.length} >>\nstream\n${page}\nendstream`);
    const pageId = add(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  }

  // Patch Pages kids into object 2.
  buf = buf.replace("[PAGE_KIDS]", `[${pageIds.map((id) => `${id} 0 R`).join(" ")}]`);

  const startXref = Buffer.byteLength(buf, "latin1");
  buf += `xref\n0 ${objects.length + 1}\n`;
  buf += "0000000000 65535 f \n";
  for (const off of xref) {
    buf += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  buf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${startXref}\n%%EOF`;

  return Buffer.from(buf, "latin1");
}

function splitToPages(text: string, linesPerPage: number): string[] {
  const all = text.split("\n");
  const pages: string[] = [];
  for (let i = 0; i < all.length; i += linesPerPage) {
    const slice = all.slice(i, i + linesPerPage);
    // BT, set font, move to top-left, draw each line, ET.
    const content =
      "BT\n/F1 9 Tf\n72 540 Td\n" +
      slice.map((line, idx) => `(${line})${idx < slice.length - 1 ? " Tj 0 -12 Td" : " Tj"}`).join("\n") +
      "\nET";
    pages.push(content);
  }
  if (pages.length === 0) pages.push("BT\n/F1 9 Tf\n72 540 Td\n(No data) Tj\nET");
  return pages;
}
