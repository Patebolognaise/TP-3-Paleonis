# PaLeonis – Contrat d'API

Base URL : `http://localhost:3000/api`

Responsables (voir [equipe.md](equipe.md)) : **CP** chef de projet, **AD** architecte données, **RA** référent API, **RQ** référent qualité.

## Conventions communes

- Corps de requête et de réponse en JSON. Noms de champs en `snake_case`, identiques aux colonnes de la base.
- Les identifiants dans l'URL (`:id`) et les clés étrangères dans les corps (`client_id`…) sont des **entiers strictement positifs**, sinon `400`.
- Les dates sont renvoyées au format `YYYY-MM-DD`, les horodatages en ISO 8601, les prix en nombre (`14.99`).
- Valeurs autorisées :
  - `client.type` : `particulier`, `entreprise`
  - `offre.categorie` : `vps`, `mutualise`, `dedie`, `domaine`
  - `abonnement.statut` : `actif`, `suspendu`, `resilie`
  - `serveur.statut` : `en_service`, `maintenance`, `hors_service`
  - `ticket.priorite` : `basse`, `normale`, `haute`, `critique`
  - `ticket.statut` : `ouvert`, `en_cours`, `resolu`, `ferme`

### Format d'erreur unique

Toutes les erreurs, quelle que soit la route, ont la même forme :

```json
{
  "error": "Message lisible par un humain",
  "details": ["précision 1", "précision 2"]
}
```

`details` n'est présent que pour les erreurs de validation (400) qui listent plusieurs champs.

### Codes HTTP

| Code | Quand |
|---|---|
| 200 | Lecture ou modification réussie |
| 201 | Création réussie (le corps contient la ressource créée) |
| 204 | Suppression réussie (pas de corps) |
| 400 | Requête mal formée : JSON invalide, champ obligatoire manquant, mauvais type, id non entier (PostgreSQL `22P02`) |
| 404 | Ressource introuvable, ou référence vers une ressource inexistante (PostgreSQL `23503` à l'insertion) |
| 409 | Conflit avec l'état des données : doublon (PostgreSQL `23505`), suppression bloquée (`23503`/`23001`, RG8), aucun serveur libre, offre retirée, transition de statut interdite |
| 422 | Données bien formées mais refusées par une règle métier de la base (`CHECK` PostgreSQL `23514`) : prix négatif, catégorie ou statut inconnu, email mal formé, SIRET manquant pour une entreprise… |
| 500 | Erreur inattendue (message générique, détail dans les logs serveur) |

**Répartition des contrôles** : le code vérifie la *forme* (présence et type JS des champs, ids entiers) et renvoie 400. Les *règles métier* (valeurs autorisées, prix ≥ 0, unicité, formats) sont portées par la base : l'erreur PostgreSQL est traduite en 409 ou 422 par le middleware d'erreurs global.

---

## Clients (B1, B5) – responsable RQ

| Méthode | URL | Rôle | Body attendu | Réponses | Besoin |
|---|---|---|---|---|---|
| GET | `/api/clients` | Lister les clients. Filtres facultatifs : `?nom=` (recherche partielle, insensible à la casse), `?email=` (idem), `?type=` | – | 200 `[client]` | B1 |
| GET | `/api/clients/:id` | Consulter un client | – | 200 `client`, 400, 404 | B1 |
| GET | `/api/clients/:id/fiche` | Fiche complète : infos + abonnements (avec offre et serveur) | – | 200 `{ ...client, abonnements: [...] }`, 400, 404 | B5 |
| POST | `/api/clients` | Créer un client | `{ type, nom, email, telephone?, siret? }` | 201 `client`, 400, 409 (email/SIRET déjà utilisé), 422 (type inconnu, SIRET manquant/en trop, email mal formé) | B1 |
| PUT | `/api/clients/:id` | Modifier un client (remplacement complet, `date_inscription` non modifiable) | `{ type, nom, email, telephone?, siret? }` | 200 `client`, 400, 404, 409, 422 | B1 |
| DELETE | `/api/clients/:id` | Supprimer un client | – | 204, 400, 404, 409 (abonnement actif ou suspendu, RG8) | B1 |

Exemple `client` :

```json
{ "id": 2, "type": "entreprise", "nom": "Boulangerie Durand SARL", "email": "contact@boulangerie-durand.fr",
  "telephone": "0478123456", "siret": "41234567800012", "date_inscription": "2023-06-02" }
```

Exemple fiche (`GET /api/clients/2/fiche`) :

```json
{
  "id": 2, "type": "entreprise", "nom": "Boulangerie Durand SARL", "...": "...",
  "abonnements": [
    { "id": 3, "date_debut": "2023-06-10", "date_fin": null, "statut": "actif", "prix_applique": 7.99,
      "offre": { "id": 5, "nom": "Mutualisé Pro", "categorie": "mutualise" },
      "serveur": { "id": 8, "nom_hote": "rbx1-web01.paleonis.net", "adresse_ip": "198.51.100.11",
                   "statut": "en_service", "datacenter": "RBX-1 (Roubaix)" } },
    { "id": 4, "...": "...", "offre": { "id": 8, "nom": "Domaine .fr", "categorie": "domaine" }, "serveur": null }
  ]
}
```

## Offres / catalogue (B2) – responsable RA

| Méthode | URL | Rôle | Body attendu | Réponses | Besoin |
|---|---|---|---|---|---|
| GET | `/api/offres` | Lister le catalogue. Filtres : `?categorie=vps`, `?en_vente=true` (ou `false`) | – | 200 `[offre]`, 400 (`en_vente` ni `true` ni `false`) | B2 |
| GET | `/api/offres/:id` | Consulter une offre | – | 200 `offre`, 400, 404 | B2 |
| POST | `/api/offres` | Créer une offre (en vente par défaut) | `{ nom, categorie, prix_mensuel_ht }` | 201 `offre`, 400, 409 (nom déjà pris), 422 (prix négatif, catégorie inconnue) | B2 |
| PUT | `/api/offres/:id` | Modifier une offre (les abonnements existants gardent leur `prix_applique`) | `{ nom, categorie, prix_mensuel_ht }` | 200 `offre`, 400, 404, 409, 422 | B2 |
| PATCH | `/api/offres/:id/retrait` | Retirer l'offre de la vente (`en_vente = false`), idempotent | – | 200 `offre`, 400, 404 | B2 |

Pas de `DELETE` : une offre ne se supprime pas (RG2), et la clé étrangère `ON DELETE RESTRICT` l'empêche aussi côté base.

## Abonnements (B3, B4) – responsable RA

| Méthode | URL | Rôle | Body attendu | Réponses | Besoin |
|---|---|---|---|---|---|
| GET | `/api/abonnements` | Lister. Filtres : `?client_id=`, `?statut=` | – | 200 `[abonnement]`, 400 | B3, B4 |
| GET | `/api/abonnements/:id` | Consulter un abonnement (avec offre et serveur) | – | 200, 400, 404 | B3 |
| POST | `/api/abonnements` | **Souscrire** : crée l'abonnement au prix catalogue et, pour un hébergement, attribue un serveur libre `en_service` du datacenter demandé, **en une transaction** | `{ client_id, offre_id, datacenter_id }` (`datacenter_id` obligatoire sauf catégorie `domaine`, interdit pour `domaine`) | 201 `abonnement`, 400, 404 (client, offre ou datacenter inexistant), 409 (offre retirée de la vente, aucun serveur libre dans ce datacenter) | B3 |
| PATCH | `/api/abonnements/:id/resiliation` | **Résilier** : `statut = resilie`, `date_fin = aujourd'hui`, le serveur redevient libre | – | 200 `abonnement`, 400, 404, 409 (déjà résilié) | B4 |
| PATCH | `/api/abonnements/:id/statut` | Suspendre / réactiver | `{ statut: "actif" \| "suspendu" }` | 200, 400 (`resilie` → utiliser `/resiliation`), 404, 409 (abonnement résilié), 422 (statut inconnu) | RG3 |

Exemple `abonnement` :

```json
{ "id": 24, "client_id": 13, "date_debut": "2026-10-28", "date_fin": null, "statut": "actif", "prix_applique": 14.99,
  "offre": { "id": 2, "nom": "VPS Pro", "categorie": "vps" },
  "serveur": { "id": 5, "nom_hote": "par1-vps05.paleonis.net", "adresse_ip": "203.0.113.15", "statut": "en_service",
               "datacenter": "PAR-1 (Paris)" } }
```

## Serveurs (B6) – responsable AD

| Méthode | URL | Rôle | Body attendu | Réponses | Besoin |
|---|---|---|---|---|---|
| GET | `/api/serveurs` | Lister. Filtres combinables : `?datacenter_id=`, `?statut=`, `?libre=true` (ou `false` = attribué) | – | 200 `[serveur]`, 400 | B6 |
| GET | `/api/serveurs/:id` | Consulter un serveur (avec l'abonnement en cours s'il est attribué) | – | 200, 400, 404 | B6 |
| PATCH | `/api/serveurs/:id/statut` | Passer en maintenance, hors service, en service | `{ statut }` | 200, 400, 404, 422 (statut inconnu) | RG5, B9 |

Chaque serveur renvoyé contient `libre` (booléen calculé) et `abonnement_id` (abonnement en cours ou `null`).

## Tickets (B7, B8) – responsable AD

| Méthode | URL | Rôle | Body attendu | Réponses | Besoin |
|---|---|---|---|---|---|
| GET | `/api/tickets` | Lister. Filtres : `?statut=`, `?priorite=`, `?client_id=`, `?technicien_id=` | – | 200 `[ticket]`, 400 | B7 |
| GET | `/api/tickets/:id` | Consulter un ticket | – | 200, 400, 404 | B7 |
| POST | `/api/tickets` | Ouvrir un ticket (statut `ouvert`, date = maintenant) | `{ client_id, sujet, description, priorite?, serveur_id? }` | 201 `ticket`, 400, 404 (client ou serveur inexistant), 422 (priorité inconnue, serveur qui n'appartient pas au client) | B7 |
| PATCH | `/api/tickets/:id/assignation` | Assigner (ou réassigner) à un technicien | `{ technicien_id }` | 200, 400, 404 (ticket ou technicien inexistant), 409 (ticket fermé) | B7 |
| PATCH | `/api/tickets/:id/statut` | Faire évoluer le statut | `{ statut }` | 200, 400, 404, 409 (transition interdite, ou `en_cours` sans technicien), 422 (statut inconnu) | B7 |

Transitions autorisées : `ouvert → en_cours | ferme`, `en_cours → resolu | ouvert`, `resolu → ferme | en_cours`, `ferme →` (aucune).

## Datacenters et techniciens (B8, B10) – responsable CP

| Méthode | URL | Rôle | Body attendu | Réponses | Besoin |
|---|---|---|---|---|---|
| GET | `/api/datacenters` | Lister les datacenters | – | 200 `[datacenter]` | B10 |
| GET | `/api/datacenters/:id` | Consulter un datacenter | – | 200, 400, 404 | B10 |
| GET | `/api/techniciens` | Lister les techniciens. Filtre : `?datacenter_id=` | – | 200 `[technicien]`, 400 | B10 |
| GET | `/api/techniciens/:id` | Consulter un technicien | – | 200, 400, 404 | B10 |
| GET | `/api/techniciens/:id/tickets` | Tickets **non fermés** du technicien, du plus critique au moins critique, puis du plus ancien au plus récent | – | 200 `[ticket]`, 400, 404 | B8 |

## Tableau de bord (B9) – responsable CP

| Méthode | URL | Rôle | Body attendu | Réponses | Besoin |
|---|---|---|---|---|---|
| GET | `/api/dashboard` | CA mensuel HT des abonnements actifs (total et par catégorie), serveurs par datacenter et par statut | – | 200 | B9 |

```json
{
  "chiffre_affaires": {
    "total_mensuel_ht": 812.36,
    "abonnements_actifs": 15,
    "par_categorie": [ { "categorie": "dedie", "ca_mensuel_ht": 561.00, "abonnements_actifs": 4 } ]
  },
  "serveurs": {
    "total": 24,
    "par_datacenter": [
      { "datacenter_id": 1, "nom": "PAR-1", "ville": "Paris", "total": 7, "libres": 1,
        "en_service": 5, "maintenance": 1, "hors_service": 1 }
    ]
  }
}
```

## Couverture des besoins

| Besoin | Endpoints |
|---|---|
| B1 | `GET/POST /clients`, `GET/PUT/DELETE /clients/:id`, recherche `?nom=` `?email=` |
| B2 | `GET/POST /offres`, `GET/PUT /offres/:id`, `PATCH /offres/:id/retrait`, filtres `?categorie=` `?en_vente=` |
| B3 | `POST /abonnements` |
| B4 | `PATCH /abonnements/:id/resiliation` |
| B5 | `GET /clients/:id/fiche` |
| B6 | `GET /serveurs?datacenter_id=&statut=&libre=` |
| B7 | `POST /tickets`, `PATCH /tickets/:id/assignation`, `PATCH /tickets/:id/statut` |
| B8 | `GET /techniciens/:id/tickets` |
| B9 | `GET /dashboard` |
| B10 | `GET /datacenters`, `GET /datacenters/:id`, `GET /techniciens`, `GET /techniciens/:id` |
