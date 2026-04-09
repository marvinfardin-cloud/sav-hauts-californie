# SAV Les Hauts de Californie

Application web de gestion du Service Après-Vente pour le magasin de motoculture **Les Hauts de Californie** (Le Lamentin, Martinique).

Gestion complète des réparations, suivi client par email, prise de rendez-vous en ligne et tableau de bord atelier.

## Fonctionnalités

### Côté Client
- Espace client accessible par lien magique email (pas de mot de passe)
- Suivi en temps réel des réparations
- Historique complet des réparations passées
- Prise de rendez-vous en ligne (dépôt, retrait, diagnostic)
- Notifications email automatiques à chaque changement de statut

### Côté Atelier
- Tableau de bord avec compteurs par statut
- Gestion des tickets SAV (création, suivi, modification)
- Planning hebdomadaire des rendez-vous
- Gestion des clients et historique
- Impression des fiches de ticket
- Assignation aux techniciens
- Notes publiques et privées

## Stack technique

- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : PostgreSQL 16 + Prisma ORM
- **Authentification** : Magic link par email (sans mot de passe)
- **Email** : Nodemailer (compatible SMTP)
- **Déploiement** : Docker Compose

## Prérequis

- Node.js 20+
- Docker et Docker Compose (pour le déploiement)
- PostgreSQL 16 (pour le développement local sans Docker)

## Installation (développement local)

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd sav-hauts-californie
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

```bash
cp .env.example .env
```

Modifiez le fichier `.env` selon votre configuration (base de données, SMTP...).

### 4. Lancer PostgreSQL (via Docker)

```bash
docker compose up -d postgres mailhog
```

Cela lance :
- PostgreSQL sur le port 5432
- Mailhog (capture d'emails en dev) sur le port 1025 (SMTP) et 8025 (interface web)

### 5. Créer le schéma de base de données

```bash
npm run db:migrate
```

### 6. Remplir la base avec des données de démonstration

```bash
npm run db:seed
```

### 7. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

Pour voir les emails en développement, ouvrez Mailhog sur [http://localhost:8025](http://localhost:8025).

## Déploiement avec Docker Compose

Pour un déploiement complet (application + base de données + mailhog) :

```bash
docker compose up -d --build
```

Puis lancer les migrations et le seed :

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npx tsx prisma/seed.ts
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

## Comptes de démonstration

Après avoir exécuté le seed, les comptes suivants sont disponibles :

**Atelier (accès via `/admin/login`)** :
- `admin@hauts-californie.fr` (Admin)
- `jean.technicien@hauts-californie.fr` (Technicien)
- `marc.technicien@hauts-californie.fr` (Technicien)

**Client (accès via `/login`)** :
- `pierre.martin@example.com`
- `marie.dupont@example.com`
- `jacques.bernard@example.com`
- `sophie.lefevre@example.com`
- `antoine.petit@example.com`

> **Mode développement** : lorsque SMTP n'est pas configuré, les liens magiques sont affichés directement dans l'interface de connexion pour faciliter les tests.

## Structure du projet

```
sav-hauts-californie/
├── prisma/
│   ├── schema.prisma          # Schéma Prisma
│   └── seed.ts                # Script de seed
├── src/
│   ├── app/
│   │   ├── api/               # API routes (auth, tickets, rdv, admin)
│   │   ├── admin/             # Pages atelier
│   │   ├── client/            # Pages client
│   │   ├── login/             # Connexion client
│   │   └── page.tsx           # Page d'accueil
│   ├── components/            # Composants partagés
│   ├── lib/
│   │   ├── auth.ts            # Gestion des sessions
│   │   ├── email.ts           # Envoi des emails
│   │   ├── prisma.ts          # Client Prisma
│   │   ├── constants.ts       # Constantes (horaires, statuts)
│   │   └── utils.ts           # Utilitaires
│   └── generated/             # Client Prisma généré
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## Informations du magasin

- **Nom** : Les Hauts de Californie
- **Adresse** : 97232 Le Lamentin
- **Téléphone** : 05.96.42.75.00
- **Email** : zingzag10@hotmail.fr

### Horaires magasin
- Lundi au vendredi : 7h-16h
- Samedi : 8h-12h

### Horaires SAV
- Lundi au jeudi : 7h-12h / 13h-16h
- Vendredi : 7h-12h / 13h-15h
- Pas de SAV le samedi et dimanche

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Compile l'application pour la production |
| `npm run start` | Lance l'application en mode production |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run db:migrate` | Crée/applique les migrations en développement |
| `npm run db:deploy` | Applique les migrations en production |
| `npm run db:generate` | Regénère le client Prisma |
| `npm run db:seed` | Remplit la base avec les données de démo |
| `npm run db:reset` | Réinitialise la base de données |

## Configuration email (production)

En production, configurez un vrai serveur SMTP dans le fichier `.env` :

```bash
SMTP_HOST="smtp.votre-fournisseur.fr"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="votre@email.fr"
SMTP_PASS="votre-mot-de-passe"
EMAIL_FROM="SAV Les Hauts de Californie <sav@hauts-californie.fr>"
```

Services SMTP recommandés : Brevo (ex-Sendinblue), Resend, Mailgun, Postmark.

## Licence

Projet privé — Les Hauts de Californie.
