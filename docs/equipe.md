# PaLeonis – Équipe, répartition et stratégie Git

> Remplacez les « Membre n » par les prénoms de l'équipe.

## Rôles

| Membre | Rôle | Casquette en plus du code |
|---|---|---|
| Membre 1 | **Chef de projet (CP)** | Planning, point d'équipe à mi-parcours, fusions Git sur `main`, porte-parole à la validation |
| Membre 2 | **Architecte données (AD)** | Garant du MCD/MLD, écrit `database/schema.sql` et `database/seed.sql` |
| Membre 3 | **Référent API (RA)** | Garant de [endpoints.md](endpoints.md) : URL cohérentes, format d'erreur unique |
| Membre 4 | **Référent qualité (RQ)** | Collection Postman, vérification des codes HTTP, README |

(À trois : RA et RQ sont fusionnés.)

## Répartition par ressource (de la route au modèle)

| Membre | Ressources | Besoins | Fichiers |
|---|---|---|---|
| CP | Socle (connexion, `server.js`, middleware d'erreurs), datacenters, techniciens, tableau de bord | B8 (route), B9, B10 | `config/db.js`, `errors.js`, `middlewares/`, `datacenter.*`, `technicien.*`, `dashboard.*` |
| AD | Schéma + jeu d'essai, serveurs, tickets | B6, B7, B8 (requête) | `database/*.sql`, `serveur.*`, `ticket.*` |
| RA | Catalogue, abonnements (dont la transaction) | B2, B3, B4 | `offre.*`, `abonnement.*` |
| RQ | Clients, fiche client | B1, B5 | `client.*`, `postman/`, `README.md` |

B3 (souscription) est la tâche la plus lourde : RA n'a que deux ressources pour compenser. B9 et B10 sont plus légers, le CP garde donc du temps pour les fusions et le point d'équipe.

## Ordre de travail

| Moment | CP | AD | RA | RQ |
|---|---|---|---|---|
| Acte 1 | Anime la conception, contrat d'API avec RA | MCD, MLD, dictionnaire | Contrat d'API, requête B3 | Requête B5, maquette Postman |
| Acte 2 (socle) | `db.js`, `server.js`, erreurs, `GET /api/datacenters` | `schema.sql`, `seed.sql` | Teste la requête B3 dans `psql` | Teste B5 et B9 dans `psql` |
| Acte 3 – 1re moitié | Datacenters, techniciens | Serveurs | Offres | Clients (CRUD + recherche) |
| Point d'équipe (≈ 1 h 15) | Fusionne ce qui est prêt | | | |
| Acte 3 – 2de moitié | Dashboard, relecture des PR | Tickets (B7, B8) | Abonnements (B3, B4) | Fiche client, collection Postman, README |

## Stratégie Git

- `main` est toujours stable : on n'y commite jamais directement, seul le CP y fusionne.
- Une branche par lot de travail, nommée `type/sujet` :
  - `docs/conception` : dossier de conception (Acte 1)
  - `feat/socle` : schéma, jeu d'essai, connexion, middleware d'erreurs, datacenters (Acte 2)
  - `feat/clients` : B1, B5
  - `feat/catalogue-abonnements` : B2, B3, B4
  - `feat/serveurs-tickets` : B6, B7, B8
  - `feat/referentiel-dashboard` : B9, B10
  - `docs/postman-readme` : collection Postman et README
  - `fix/...` : corrections issues du crash test
- Chacun part de `main` **après** la fusion du socle, et refait `git pull origin main` avant de demander une fusion.
- Fusion par le CP avec `git merge --no-ff` (ou pull request GitHub) pour garder la trace de chaque branche dans l'historique.
- Messages de commit courts, au présent, préfixés : `feat:`, `fix:`, `docs:`, `chore:`.
- Fichiers partagés (`server.js`, `errors.js`) : une seule ligne ajoutée par ressource (le `app.use(...)` de sa route), pour limiter les conflits.
