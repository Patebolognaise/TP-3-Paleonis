# PaLeonis – API SQL

Back-end de l'espace client PaLeonis : Express 5, architecture MVC, PostgreSQL, SQL écrit à la main (requêtes paramétrées, pas d'ORM).

- Conception (dictionnaire, MCD, MLD, diagramme de séquence, requêtes) : [docs/conception.md](docs/conception.md)
- Contrat d'API : [docs/endpoints.md](docs/endpoints.md)
- Équipe, répartition, stratégie Git : [docs/equipe.md](docs/equipe.md)
- Collection Postman : [postman/paleonis.postman_collection.json](postman/paleonis.postman_collection.json)

## Prérequis

- Node.js 18 ou plus récent
- PostgreSQL 14 ou plus récent, **ou** Docker

## Installation

### 1. Cloner et installer les dépendances

```bash
git clone https://github.com/Patebolognaise/TP-3-Paleonis.git
cd TP-3-Paleonis
npm install
```

### 2. Lancer PostgreSQL et créer la base

**Avec Docker** (crée directement l'utilisateur et la base `paleonis`) :

```bash
docker run --name paleonis-db -e POSTGRES_USER=paleonis -e POSTGRES_PASSWORD=paleonis -e POSTGRES_DB=paleonis -p 5432:5432 -d postgres:16
```

**Sans Docker** (PostgreSQL installé localement), en tant que super-utilisateur `postgres` :

```bash
psql -U postgres -c "CREATE USER paleonis WITH PASSWORD 'paleonis';"
psql -U postgres -c "CREATE DATABASE paleonis OWNER paleonis;"
```

> Sous Windows, `psql` se trouve dans `C:\Program Files\PostgreSQL\<version>\bin\` s'il n'est pas dans le PATH. pgAdmin permet aussi de créer l'utilisateur et la base.

### 3. Configurer l'environnement

```bash
cp .env.example .env
```

Puis renseignez `DB_USER` et `DB_PASSWORD` dans `.env` (`paleonis` / `paleonis` avec les commandes ci-dessus).

| Variable | Rôle |
|---|---|
| `PORT` | Port de l'API (3000 par défaut) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Connexion PostgreSQL |
| `SIMULER_PANNE_B3` | `1` pour faire échouer volontairement une souscription après l'`INSERT` (démo du `ROLLBACK`), `0` sinon |

### 4. Créer les tables et charger le jeu d'essai

```bash
npm run db:reset
```

Ce script exécute `database/schema.sql` puis `database/seed.sql` avec la connexion du `.env`. Il est rejouable : il remet la base dans son état initial à chaque fois.

Équivalent avec `psql` ou Docker :

```bash
psql -U paleonis -d paleonis -f database/schema.sql
psql -U paleonis -d paleonis -f database/seed.sql
# alternative
docker exec -i paleonis-db psql -U paleonis -d paleonis < database/schema.sql
docker exec -i paleonis-db psql -U paleonis -d paleonis < database/seed.sql
```

### 5. Lancer l'API

```bash
npm run dev     # avec rechargement automatique (nodemon)
npm start       # sans
```

La console doit afficher `Connecté à PostgreSQL`. Test rapide : <http://localhost:3000/api/datacenters>.

## Tester avec Postman

1. Importer `postman/paleonis.postman_collection.json`.
2. La variable de collection `baseUrl` vaut `http://localhost:3000/api`.
3. `npm run db:reset`, puis lancer toute la collection (Run collection) : chaque requête vérifie son code HTTP. Le dossier **Crash test** contient les cas d'erreur (doublons, prix négatif, id inexistant, RG8, pas de serveur libre…).

## Jeu d'essai

4 datacenters, 5 techniciens, 10 offres (dont 1 retirée), 14 clients, 24 serveurs, 23 abonnements, 14 tickets. Quelques cas utiles :

| Cas | Données |
|---|---|
| Client sans abonnement (supprimable, idéal pour une souscription) | client 13 |
| Client avec uniquement des abonnements résiliés (supprimable) | client 14 |
| Client avec abonnement actif (suppression refusée, RG8) | client 1 |
| Datacenter sans serveur libre (souscription refusée, 409) | SXB-1 (id 4) |
| Offre retirée de la vente | offre 10 « VPS Legacy » |
| Technicien avec plusieurs tickets de priorités différentes (B8) | technicien 1 |

## Démo des points clés

**Souscription d'un hébergement (B3)** : `POST /api/abonnements` avec `{ "client_id": 13, "offre_id": 2, "datacenter_id": 3 }` → 201, un serveur libre de Lyon est attribué. Puis `GET /api/clients/13/fiche` (B5) et `GET /api/dashboard` (B9).

**Transaction tout ou rien** : passer `SIMULER_PANNE_B3=1` dans `.env`, redémarrer, refaire la souscription → 500, et en base `SELECT count(*) FROM abonnement;` n'a pas bougé. Remettre `0` ensuite.

**RG8** : `DELETE /api/clients/1` → 409. La règle est portée par un trigger PostgreSQL : même un `DELETE` lancé directement dans `psql` est refusé.

## Choix techniques

- **Contraintes dans la base** : unicité (email insensible à la casse, SIRET, nom d'hôte, IP), `CHECK` sur toutes les valeurs autorisées et les prix, SIRET obligatoire pour les entreprises uniquement, trigger RG8, index unique partiel « un serveur = un seul abonnement en cours ».
- **Serveur libre calculé** : un serveur est libre s'il n'a aucun abonnement non résilié. Résilier suffit donc à le libérer, et l'historique des attributions est conservé.
- **Répartition des contrôles** : le contrôleur vérifie la forme de la requête (400) ; la base vérifie les règles métier, et le middleware d'erreurs global traduit les codes PostgreSQL (`23505` → 409, `23514` → 422, `23503` → 404/409, `22P02` → 400).
- **Format d'erreur unique** : `{ "error": "message", "details": [...] }`.
- **Types pg** : les colonnes `DATE` sont renvoyées en `YYYY-MM-DD` (pas de décalage de fuseau) et les `NUMERIC` en nombres (voir `src/config/db.js`).

## Arborescence

```
├── database/        schema.sql, seed.sql, reset.js
├── docs/            conception.md, endpoints.md, equipe.md
├── postman/         collection exportée
└── src/
    ├── config/      db.js (pool PostgreSQL)
    ├── controllers/ HTTP uniquement : validation de forme, codes de réponse
    ├── middlewares/ 404 et middleware d'erreurs global
    ├── models/      classes à méthodes statiques, tout le SQL est ici
    ├── routes/
    ├── utils/       validation des body et query strings
    ├── errors.js    erreurs métier
    └── server.js
```
