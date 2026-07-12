import { PrismaClient, RoleName, VehicleStatus, DriverStatus, TripStatus, NotificationType } from "@prisma/client";
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
    Object.values(RoleName).map((name) => prisma.role.create({ data: { name } }))
  );
  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));

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
      const status = idx === 1 ? VehicleStatus.IN_SHOP : idx % 5 === 0 ? VehicleStatus.ON_TRIP : VehicleStatus.AVAILABLE;
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
          status: idx === 3 ? DriverStatus.SUSPENDED : idx === 4 ? DriverStatus.ON_TRIP : DriverStatus.AVAILABLE,
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
      status: TripStatus.DRAFT,
      createdById: admin.id,
    },
  });

  await prisma.notificationLog.create({
    data: {
      userId: admin.id,
      type: NotificationType.DOCUMENT_EXPIRY,
      title: "Document expiring soon",
      body: "Insurance for IR-100 expires within 7 days.",
    },
  });
}

main().finally(async () => prisma.$disconnect());
