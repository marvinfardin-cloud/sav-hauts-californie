import { PrismaClient, Statut, Role } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data
  await prisma.historique.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.session.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.rendezVous.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Create staff users
  const admin = await prisma.user.create({
    data: {
      email: "admin@hauts-californie.fr",
      nom: "Admin",
      role: Role.ADMIN,
    },
  });

  const tech1 = await prisma.user.create({
    data: {
      email: "jean.technicien@hauts-californie.fr",
      nom: "Jean Technicien",
      role: Role.TECHNICIEN,
    },
  });

  const tech2 = await prisma.user.create({
    data: {
      email: "marc.technicien@hauts-californie.fr",
      nom: "Marc Dubois",
      role: Role.TECHNICIEN,
    },
  });

  console.log("✅ Created staff users");

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        email: "pierre.martin@example.com",
        nom: "Martin",
        prenom: "Pierre",
        telephone: "0596123456",
      },
    }),
    prisma.client.create({
      data: {
        email: "marie.dupont@example.com",
        nom: "Dupont",
        prenom: "Marie",
        telephone: "0596234567",
      },
    }),
    prisma.client.create({
      data: {
        email: "jacques.bernard@example.com",
        nom: "Bernard",
        prenom: "Jacques",
        telephone: "0596345678",
      },
    }),
    prisma.client.create({
      data: {
        email: "sophie.lefevre@example.com",
        nom: "Lefèvre",
        prenom: "Sophie",
        telephone: "0596456789",
      },
    }),
    prisma.client.create({
      data: {
        email: "antoine.petit@example.com",
        nom: "Petit",
        prenom: "Antoine",
        telephone: "0596567890",
      },
    }),
  ]);

  console.log(`✅ Created ${clients.length} clients`);

  // Create tickets with realistic data
  const year = new Date().getFullYear();
  const ticketData = [
    {
      clientIdx: 0,
      materiel: "Tondeuse thermique",
      marque: "Honda",
      modele: "HRX 476",
      numeroSerie: "H123456",
      panneDeclaree: "Ne démarre pas, corde bloquée",
      statut: Statut.EN_REPARATION,
      notesPubliques: "Diagnostic terminé. Remplacement de la bobine d'allumage en cours.",
      technicienId: tech1.id,
      daysAgo: 5,
    },
    {
      clientIdx: 1,
      materiel: "Débroussailleuse",
      marque: "Stihl",
      modele: "FS 55",
      numeroSerie: "S789012",
      panneDeclaree: "Perte de puissance, fumée blanche",
      statut: Statut.DIAGNOSTIC,
      technicienId: tech2.id,
      daysAgo: 2,
    },
    {
      clientIdx: 2,
      materiel: "Tronçonneuse",
      marque: "Husqvarna",
      modele: "450 II",
      numeroSerie: "HQ456789",
      panneDeclaree: "Chaîne qui saute, lubrification défaillante",
      statut: Statut.PRET,
      notesPubliques: "Réparation terminée. Nouvelle pompe à huile installée et chaîne réglée.",
      technicienId: tech1.id,
      daysAgo: 10,
    },
    {
      clientIdx: 3,
      materiel: "Taille-haie",
      marque: "Ryobi",
      modele: "RHT1850",
      panneDeclaree: "Lame bloquée",
      statut: Statut.RECU,
      daysAgo: 0,
    },
    {
      clientIdx: 4,
      materiel: "Tondeuse autoportée",
      marque: "John Deere",
      modele: "X125",
      numeroSerie: "JD987654",
      panneDeclaree: "Problème de courroie, bruit anormal",
      statut: Statut.ATTENTE_PIECES,
      notesPubliques: "Diagnostic effectué. Pièces commandées, délai 5-7 jours.",
      technicienId: tech2.id,
      daysAgo: 7,
    },
    {
      clientIdx: 0,
      materiel: "Souffleur",
      marque: "Echo",
      modele: "PB-580T",
      panneDeclaree: "Ne monte pas en régime",
      statut: Statut.LIVRE,
      notesPubliques: "Carburateur nettoyé. Filtre à air remplacé.",
      technicienId: tech1.id,
      daysAgo: 30,
    },
  ];

  for (let i = 0; i < ticketData.length; i++) {
    const data = ticketData[i];
    const numero = `SAV-${year}-${String(i + 1).padStart(4, "0")}`;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - data.daysAgo);

    const dateEstimee = new Date(createdAt);
    dateEstimee.setDate(dateEstimee.getDate() + 7);

    const ticket = await prisma.ticket.create({
      data: {
        numero,
        clientId: clients[data.clientIdx].id,
        materiel: data.materiel,
        marque: data.marque,
        modele: data.modele,
        numeroSerie: data.numeroSerie,
        panneDeclaree: data.panneDeclaree,
        statut: data.statut,
        dateDepot: createdAt,
        dateEstimee: data.statut !== Statut.LIVRE ? dateEstimee : null,
        notesPubliques: data.notesPubliques,
        technicienId: data.technicienId,
        createdAt,
      },
    });

    // Build history based on status
    const statuses = [Statut.RECU, Statut.DIAGNOSTIC, Statut.ATTENTE_PIECES, Statut.EN_REPARATION, Statut.PRET, Statut.LIVRE];
    const currentIdx = statuses.indexOf(data.statut);
    for (let j = 0; j <= currentIdx; j++) {
      const histDate = new Date(createdAt);
      histDate.setHours(histDate.getHours() + j * 12);
      await prisma.historique.create({
        data: {
          ticketId: ticket.id,
          statut: statuses[j],
          note: j === 0 ? "Dépôt du matériel" : undefined,
          createdAt: histDate,
        },
      });
    }
  }

  console.log(`✅ Created ${ticketData.length} tickets with history`);

  // Create some appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(14, 30, 0, 0);

  await prisma.rendezVous.createMany({
    data: [
      {
        clientId: clients[0].id,
        dateHeure: tomorrow,
        type: "depot",
        notes: "Dépôt d'une motopompe",
      },
      {
        clientId: clients[1].id,
        dateHeure: dayAfter,
        type: "retrait",
      },
      {
        clientId: clients[2].id,
        dateHeure: new Date(new Date().setHours(10, 0, 0, 0)),
        type: "diagnostic",
        notes: "Vérification d'une tronçonneuse",
      },
    ],
  });

  console.log("✅ Created appointments");
  console.log("🎉 Seed completed successfully!");
  console.log("\n📋 Test credentials:");
  console.log("   Admin: admin@hauts-californie.fr");
  console.log("   Technicien 1: jean.technicien@hauts-californie.fr");
  console.log("   Technicien 2: marc.technicien@hauts-californie.fr");
  console.log("   Client: pierre.martin@example.com\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
