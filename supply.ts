import { createHmac } from "node:crypto";
import { Router, type IRouter } from "express";
import {
  GetCascadeSimulationQueryParams,
  GetCascadeSimulationResponse,
  GetDashboardSummaryResponse,
  GetPublicAvailabilityResponse,
  ListDispatchOrdersResponse,
  ListFacilitiesResponse,
  ListInventoryResponse,
  PostSmsWebhookBody,
  PostSmsWebhookResponse,
  RunRebalanceOptimizerResponse,
} from "@workspace/api-zod";

type Facility = {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  leadTimeDays: number;
};

type InventoryItem = {
  facilityId: string;
  facilityName: string;
  facilityType: string;
  drugCode: string;
  drugName: string;
  unit: string;
  currentUnits: number;
  dailyBurn: number;
  expiryDays: number;
  runOutDays: number;
  status: string;
  batchId: string;
};

type RebalanceOrder = {
  id: string;
  donorId: string;
  donorName: string;
  recipientId: string;
  recipientName: string;
  drugCode: string;
  drugName: string;
  units: number;
  distanceKm: number;
  expiryDays: number;
  eta: string;
  carrier: string;
  status: string;
  authorizationCode: string;
  batchId: string | null;
};

const facilities: Facility[] = [
  { id: "PHC_01", name: "Kallianpur Rural PHC", type: "Primary Health Centre", lat: 13.3941, lon: 74.7432, leadTimeDays: 7 },
  { id: "CHC_02", name: "Brahmavar Community Hospital", type: "Community Health Centre", lat: 13.435, lon: 74.75, leadTimeDays: 7 },
  { id: "PHC_03", name: "Malpe Coastal Dispensary", type: "Primary Health Centre", lat: 13.354, lon: 74.703, leadTimeDays: 5 },
  { id: "DH_04", name: "Udupi District Civil Hospital", type: "District Hospital", lat: 13.3409, lon: 74.7421, leadTimeDays: 4 },
  { id: "PHC_05", name: "Kaup Taluk Clinic", type: "Primary Health Centre", lat: 13.224, lon: 74.744, leadTimeDays: 6 },
];

const inventory: InventoryItem[] = [
  { facilityId: "PHC_01", facilityName: "Kallianpur Rural PHC", facilityType: "PHC", drugCode: "TEL40", drugName: "Telmisartan 40mg", unit: "tablets", currentUnits: 10, dailyBurn: 8, expiryDays: 120, runOutDays: 1.2, status: "critical", batchId: "TEL-KAL-2406" },
  { facilityId: "PHC_01", facilityName: "Kallianpur Rural PHC", facilityType: "PHC", drugCode: "AMLO5", drugName: "Amlodipine 5mg", unit: "tablets", currentUnits: 45, dailyBurn: 4, expiryDays: 180, runOutDays: 11.3, status: "balanced", batchId: "AML-KAL-2411" },
  { facilityId: "CHC_02", facilityName: "Brahmavar Community Hospital", facilityType: "CHC", drugCode: "TEL40", drugName: "Telmisartan 40mg", unit: "tablets", currentUnits: 520, dailyBurn: 11, expiryDays: 38, runOutDays: 47.3, status: "surplus", batchId: "TEL-BRA-2403" },
  { facilityId: "CHC_02", facilityName: "Brahmavar Community Hospital", facilityType: "CHC", drugCode: "AMLO5", drugName: "Amlodipine 5mg", unit: "tablets", currentUnits: 200, dailyBurn: 6, expiryDays: 140, runOutDays: 33.3, status: "balanced", batchId: "AML-BRA-2410" },
  { facilityId: "PHC_03", facilityName: "Malpe Coastal Dispensary", facilityType: "PHC", drugCode: "TEL40", drugName: "Telmisartan 40mg", unit: "tablets", currentUnits: 8, dailyBurn: 6, expiryDays: 90, runOutDays: 1.3, status: "critical", batchId: "TEL-MAL-2407" },
  { facilityId: "PHC_03", facilityName: "Malpe Coastal Dispensary", facilityType: "PHC", drugCode: "AMLO5", drugName: "Amlodipine 5mg", unit: "tablets", currentUnits: 30, dailyBurn: 3, expiryDays: 150, runOutDays: 10, status: "balanced", batchId: "AML-MAL-2412" },
  { facilityId: "DH_04", facilityName: "Udupi District Civil Hospital", facilityType: "DH", drugCode: "TEL40", drugName: "Telmisartan 40mg", unit: "tablets", currentUnits: 850, dailyBurn: 22, expiryDays: 42, runOutDays: 38.6, status: "surplus", batchId: "TEL-UDU-2402" },
  { facilityId: "DH_04", facilityName: "Udupi District Civil Hospital", facilityType: "DH", drugCode: "AMLO5", drugName: "Amlodipine 5mg", unit: "tablets", currentUnits: 450, dailyBurn: 10, expiryDays: 55, runOutDays: 45, status: "surplus", batchId: "AML-UDU-2404" },
  { facilityId: "PHC_05", facilityName: "Kaup Taluk Clinic", facilityType: "PHC", drugCode: "TEL40", drugName: "Telmisartan 40mg", unit: "tablets", currentUnits: 85, dailyBurn: 7, expiryDays: 160, runOutDays: 12.1, status: "balanced", batchId: "TEL-KAU-2409" },
  { facilityId: "PHC_05", facilityName: "Kaup Taluk Clinic", facilityType: "PHC", drugCode: "AMLO5", drugName: "Amlodipine 5mg", unit: "tablets", currentUnits: 70, dailyBurn: 5, expiryDays: 200, runOutDays: 14, status: "balanced", batchId: "AML-KAU-2414" },
];

let dispatchOrders: RebalanceOrder[] = [];

function authCode(orderId: string) {
  const secret = process.env.SESSION_SECRET ?? "aushadhi-chakra-demo";
  return `CDSCO-AUTH-${createHmac("sha256", secret).update(orderId).digest("hex").slice(0, 12).toUpperCase()}`;
}

function optimizeOrders(): RebalanceOrder[] {
  if (dispatchOrders.length) return dispatchOrders;
  const recipients = inventory.filter((item) => item.drugCode === "TEL40" && item.status === "critical");
  const donors = inventory.filter((item) => item.drugCode === "TEL40" && item.status === "surplus").sort((a, b) => a.expiryDays - b.expiryDays);
  const candidates = [
    { donor: donors.find((item) => item.facilityId === "CHC_02")!, recipient: recipients.find((item) => item.facilityId === "PHC_01")!, units: 70, distanceKm: 4.6, eta: "3h 12m" },
    { donor: donors.find((item) => item.facilityId === "DH_04")!, recipient: recipients.find((item) => item.facilityId === "PHC_03")!, units: 40, distanceKm: 5.2, eta: "3h 48m" },
  ];
  dispatchOrders = candidates.map((candidate, index) => {
    const id = `REB-${String(index + 1).padStart(3, "0")}`;
    return {
      id,
      donorId: candidate.donor.facilityId,
      donorName: candidate.donor.facilityName,
      recipientId: candidate.recipient.facilityId,
      recipientName: candidate.recipient.facilityName,
      drugCode: candidate.recipient.drugCode,
      drugName: candidate.recipient.drugName,
      units: candidate.units,
      distanceKm: candidate.distanceKm,
      expiryDays: candidate.donor.expiryDays,
      eta: candidate.eta,
      carrier: "108 EMS Return Trip",
      status: "ready",
      authorizationCode: authCode(id),
      batchId: candidate.donor.batchId,
    };
  });
  return dispatchOrders;
}

function refreshRunout(item: InventoryItem) {
  item.runOutDays = Number((item.currentUnits / Math.max(item.dailyBurn, 0.1)).toFixed(1));
  if (item.runOutDays < 2) item.status = "critical";
  else if (item.expiryDays < item.runOutDays + 14) item.status = "surplus";
  else item.status = "balanced";
}

const router: IRouter = Router();

router.get("/facilities", (_req, res) => res.json(ListFacilitiesResponse.parse(facilities)));
router.get("/inventory", (_req, res) => res.json(ListInventoryResponse.parse(inventory)));

router.get("/dashboard/summary", (_req, res) => {
  const data = {
    monitoredFacilities: facilities.length,
    criticalDeficits: new Set(inventory.filter((item) => item.status === "critical").map((item) => item.facilityId)).size,
    nearExpiryUnits: inventory.filter((item) => item.expiryDays <= 45 && item.status === "surplus").reduce((sum, item) => sum + item.currentUnits, 0),
    transitLeadTime: "3.4 Hours (108 EMS)",
    generatedAt: new Date().toISOString(),
  };
  res.json(GetDashboardSummaryResponse.parse(data));
});

router.get("/simulation/cascade", (req, res) => {
  const params = GetCascadeSimulationQueryParams.parse(req.query);
  const rows = inventory
    .filter((item) => item.drugCode === "TEL40")
    .map((item) => {
      const cascadeFactor = item.status === "critical" ? 1 + params.displacement * 0.28 + (params.spike - 1) * 0.35 : 1 + (params.spike - 1) * 0.12;
      const cascadedBurnRate = Number((item.dailyBurn * cascadeFactor).toFixed(1));
      const updatedRunOutDays = Number((item.currentUnits / cascadedBurnRate).toFixed(1));
      const rawShadowStockoutIndex = Math.min(100, Math.round((1 / Math.max(updatedRunOutDays, 0.3)) * 22 + params.elasticity * 16 + params.displacement * 18));
      const shadowStockoutIndex = Number((rawShadowStockoutIndex / 100).toFixed(2));
      return {
        facilityId: item.facilityId,
        facilityName: item.facilityName,
        drugName: item.drugName,
        originalBurnRate: item.dailyBurn,
        cascadedBurnRate,
        updatedRunOutDays,
        shadowStockoutIndex,
        status: rawShadowStockoutIndex > 70 ? "fragile" : rawShadowStockoutIndex > 40 ? "watch" : "stable",
      };
    });
  const systemRisk = Number((rows.reduce((sum, row) => sum + row.shadowStockoutIndex, 0) / rows.length).toFixed(2));
  res.json(GetCascadeSimulationResponse.parse({ ...params, rows, systemRisk }));
});

router.post("/rebalance/optimize", (_req, res) => {
  res.json(RunRebalanceOptimizerResponse.parse(optimizeOrders()));
});
router.get("/dispatch/orders", (_req, res) => {
  res.json(ListDispatchOrdersResponse.parse(optimizeOrders()));
});

router.post("/sms-webhook", (req, res) => {
  const parsed = PostSmsWebhookBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Message is required." });
  const parts = parsed.data.message.trim().toUpperCase().split(/\s+/);
  if (parts.length !== 4 || parts[0] !== "STK") return res.status(400).json({ error: "Use STK <facility_id> <drug_code> <units>." });
  const [, facilityId, drugCode, unitsText] = parts;
  const units = Number(unitsText);
  const item = inventory.find((row) => row.facilityId === facilityId && row.drugCode === drugCode);
  if (!item || !Number.isFinite(units) || units < 0) return res.status(400).json({ error: "Unknown facility, drug code, or units." });
  item.currentUnits = units;
  refreshRunout(item);
  const response = { ok: true, message: `Stock level synced for ${facilityId} / ${drugCode}.`, facilityId, drugCode, units, timestamp: new Date().toISOString() };
  return res.json(PostSmsWebhookResponse.parse(response));
});

router.get("/public/availability", (_req, res) => {
  const telmisartanRows = inventory.filter((item) => item.drugCode === "TEL40");
  const availability = Math.round((telmisartanRows.filter((item) => item.runOutDays >= 2).length / telmisartanRows.length) * 100);
  const data = {
    updatedAt: new Date().toISOString(),
    essentialMedicineAvailability: availability,
    taluks: [
      { name: "Udupi", availabilityPercent: 92, verifiedClinics: 2, status: "stable" },
      { name: "Brahmavar", availabilityPercent: 96, verifiedClinics: 1, status: "stable" },
      { name: "Malpe", availabilityPercent: 71, verifiedClinics: 1, status: "watch" },
    ],
    nearestClinic: {
      name: "Kallianpur Rural PHC",
      taluk: "Udupi",
      distanceKm: 2.4,
      medicines: ["Amlodipine 5mg", "ORS sachets"],
      verifiedAt: "08:42 IST",
    },
    advisory: "Verified government clinics are the safest source for essential medicines. Avoid inflated retail prices at private pharmacies and ask for a printed receipt.",
  };
  res.json(GetPublicAvailabilityResponse.parse(data));
});

export default router;