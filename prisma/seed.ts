import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.notificationLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.vehicleDocument.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  const roles = await Promise.all(
    ["FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST", "ADMIN"].map((name) => prisma.role.create({ data: { name } }))
  );
  const roleMap = Object.fromEntries(roles.map((r: any) => [r.name, r.id]));

  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@ironroute.local",
      passwordHash: hashSync("Admin123!", 10),
      roleId: roleMap.ADMIN,
    },
  });

  await prisma.user.createMany({
    data: [
      { name: "Fleet Manager", email: "manager@ironroute.local", passwordHash: hashSync("Manager123!", 10), roleId: roleMap.FLEET_MANAGER },
      { name: "Safety Officer", email: "safety@ironroute.local", passwordHash: hashSync("Safety123!", 10), roleId: roleMap.SAFETY_OFFICER },
      { name: "Financial Analyst", email: "finance@ironroute.local", passwordHash: hashSync("Finance123!", 10), roleId: roleMap.FINANCIAL_ANALYST },
      { name: "Driver User", email: "driver@ironroute.local", passwordHash: hashSync("Driver123!", 10), roleId: roleMap.DRIVER },
    ],
  });

  const vehicles = await Promise.all(
    Array.from({ length: 12 }, (_, idx) => {
      const status = idx === 1 ? "IN_SHOP" : idx % 5 === 0 ? "ON_TRIP" : "AVAILABLE";
      return prisma.vehicle.create({
        data: {
          registrationNumber: `IR-${100 + idx}`,
          nameModel: `Van-${idx + 1}`,
          type: idx % 2 === 0 ? "Van" : "Truck",
          maxLoadCapacityKg: 500 + idx * 100,
          odometerKm: 12000 + idx * 1400,
          acquisitionCost: 22000 + idx * 3000,
          region: idx % 2 === 0 ? "North" : "South",
          status,
        },
      });
    })
  );

  await Promise.all(
    Array.from({ length: 8 }, (_, idx) =>
      prisma.driver.create({
        data: {
          name: `Driver ${idx + 1}`,
          licenseNumber: `LIC-${500 + idx}`,
          licenseCategory: idx % 2 === 0 ? "LMV" : "HMV",
          licenseExpiryDate: new Date(Date.now() + (idx === 0 ? 4 : 180 + idx) * 24 * 3600 * 1000),
          contactNumber: `+919999000${idx}`,
          safetyScore: 70 + idx * 3,
          region: idx % 2 === 0 ? "North" : "South",
          status: idx === 3 ? "SUSPENDED" : idx === 4 ? "ON_TRIP" : "AVAILABLE",
        },
      })
    )
  );

  await prisma.vehicleDocument.create({
    data: {
      vehicleId: vehicles[0].id,
      type: "Insurance",
      fileKey: "docs/insurance-ir-100.pdf",
      expiresAt: new Date(Date.now() + 6 * 24 * 3600 * 1000),
    },
  });

  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicles[1].id,
      description: "Brake pad replacement",
      isOpen: true,
    },
  });

  await prisma.trip.create({
    data: {
      source: "Pune",
      destination: "Mumbai",
      cargoWeightKg: 450,
      plannedDistanceKm: 160,
      status: "DRAFT",
      createdById: admin.id,
    },
  });

  // Phase 5 acceptance: ≥2 (here 3) pending trips so the batch optimizer
  // produces a fleet-wide optimal assignment for the staged comparison demo.
  await prisma.trip.createMany({
    data: [
      {
        source: "Pune",
        destination: "Nashik",
        cargoWeightKg: 600,
        plannedDistanceKm: 210,
        status: "DRAFT",
        createdById: admin.id,
      },
      {
        source: "Mumbai",
        destination: "Surat",
        cargoWeightKg: 900,
        plannedDistanceKm: 290,
        status: "DRAFT",
        createdById: admin.id,
      },
    ],
  });

  // Phase 7 acceptance: fuel log history + a seeded anomaly for vehicle IR-100.
  // Baseline efficiency for IR-100 hovers ~8 L/100km; the last entry spikes to
  // ~20 L/100km, which the z-score anomaly detector must flag with the deviation.
  const fuelVehicle = vehicles[0];
  const fuelDates = [70, 56, 42, 28, 14, 7].map((d) => new Date(Date.now() - d * 24 * 3600 * 1000));
  const fuelEntries = [
    { liters: 40, cost: 4400, date: fuelDates[0] }, // 500km -> 8.0 L/100km (baseline)
    { liters: 38, cost: 4180, date: fuelDates[1] }, // 475km -> 8.0
    { liters: 42, cost: 4620, date: fuelDates[2] }, // 525km -> 8.0
    { liters: 39, cost: 4290, date: fuelDates[3] }, // 487km -> 8.0
    { liters: 41, cost: 4510, date: fuelDates[4] }, // 512km -> 8.0
    { liters: 60, cost: 6600, date: fuelDates[5] }, // 300km -> 20.0 (ANOMALY)
  ];
  await prisma.fuelLog.createMany({
    data: fuelEntries.map((f) => ({ vehicleId: fuelVehicle.id, ...f })),
  });

  // Phase 7 acceptance: maintenance history for a vehicle so the linear
  // regression predicts the next service window. Older closed records + the
  // open record already created for IR-101 give the regression real signal.
  await prisma.maintenanceLog.createMany({
    data: [
      {
        vehicleId: vehicles[0].id,
        description: "Oil change",
        isOpen: false,
        openedAt: new Date(Date.now() - 220 * 24 * 3600 * 1000),
        closedAt: new Date(Date.now() - 215 * 24 * 3600 * 1000),
      },
      {
        vehicleId: vehicles[0].id,
        description: "Tire rotation",
        isOpen: false,
        openedAt: new Date(Date.now() - 130 * 24 * 3600 * 1000),
        closedAt: new Date(Date.now() - 128 * 24 * 3600 * 1000),
      },
    ],
  });

  await prisma.notificationLog.create({
    data: {
      userId: admin.id,
      type: "DOCUMENT_EXPIRY",
      title: "Document expiring soon",
      body: "Insurance for IR-100 expires within 7 days.",
    },
  });
}

main().finally(async () => prisma.$disconnect());
