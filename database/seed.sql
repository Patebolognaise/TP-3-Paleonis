-- =====================================================================
-- PaLeonis - jeu d'essai (TP 3)
-- 3 datacenters, 4 techniciens, 8 offres, 12 clients, 14 abonnements,
-- 20 serveurs (10 attribués, 10 libres), 12 tickets dans tous les statuts.
-- A charger APRES schema.sql (qui vide les tables).
-- =====================================================================

SET client_encoding = 'UTF8'; -- fichiers en UTF-8 (indispensable sous Windows)

BEGIN;

INSERT INTO datacenter (nom, ville) VALUES
    ('PAR-1 Saint-Denis',   'Saint-Denis'),   -- 1
    ('LYS-1 Vénissieux',    'Vénissieux'),    -- 2
    ('MRS-1 Port de Marseille', 'Marseille'); -- 3

INSERT INTO technicien (nom, prenom, email_pro, id_datacenter) VALUES
    ('Martin',  'Lucas',   'lucas.martin@paleonis.fr',   1), -- 1
    ('Diallo',  'Aïssata', 'aissata.diallo@paleonis.fr', 1), -- 2
    ('Moreau',  'Hugo',    'hugo.moreau@paleonis.fr',    2), -- 3
    ('Benali',  'Sarah',   'sarah.benali@paleonis.fr',   3); -- 4

INSERT INTO offre (nom, categorie, prix_mensuel_ht, en_vente) VALUES
    ('VPS Starter',          'vps',       9.99,  TRUE),  -- 1
    ('VPS Pro',              'vps',       24.99, TRUE),  -- 2
    ('Mutualisé Perso',      'mutualise', 4.99,  TRUE),  -- 3
    ('Mutualisé Business',   'mutualise', 12.99, TRUE),  -- 4
    ('Dédié Performance',    'dedie',     89.00, TRUE),  -- 5
    ('Dédié Entreprise',     'dedie',     149.00, TRUE), -- 6
    ('Nom de domaine .fr',   'domaine',   1.25,  TRUE),  -- 7
    ('VPS Legacy',           'vps',       7.99,  FALSE); -- 8 retirée de la vente (RG2)

INSERT INTO client (type_client, nom, email, telephone, date_inscription, siret) VALUES
    ('particulier', 'Camille Durand',      'camille.durand@mail.fr',    '0612345678', '2026-01-08', NULL),             -- 1
    ('entreprise',  'Atelier Numérique SARL', 'contact@atelier-num.fr', '0145678910', '2025-10-20', '81234567800017'), -- 2
    ('particulier', 'Yanis Haddad',        'yanis.haddad@mail.fr',      NULL,         '2026-03-12', NULL),             -- 3
    ('entreprise',  'Boulangerie Le Blé',  'compta@leble.fr',           '0478123456', '2026-01-25', '79865432100021'), -- 4
    ('entreprise',  'Transports Rapides SAS', 'it@transrapides.fr',    '0491234567', '2025-08-30', '50123456700034'), -- 5
    ('particulier', 'Inès Fofana',         'ines.fofana@mail.fr',       '0698765432', '2024-05-28', NULL),             -- 6
    ('entreprise',  'Studio Pixel',        'hello@studiopixel.fr',      NULL,         '2025-04-27', '84567891200012'), -- 7
    ('particulier', 'Thomas Leroy',        'thomas.leroy@mail.fr',      '0611223344', '2026-05-30', NULL),             -- 8
    ('particulier', 'Nadia Ouattara',      'nadia.ouattara@mail.fr',    NULL,         '2024-12-20', NULL),             -- 9
    ('entreprise',  'Clinique du Parc',    'dsi@cliniqueduparc.fr',     '0142424242', '2026-06-28', '43210987600045'), -- 10
    ('particulier', 'Julien Petit',        'julien.petit@mail.fr',      '0755667788', '2026-08-10', NULL),             -- 11
    ('particulier', 'Léa Garnier',         'lea.garnier@mail.fr',       NULL,         '2026-10-01', NULL);             -- 12 aucun abonnement

-- prix_applique = prix au moment de la souscription (RG3) : il peut différer du catalogue
INSERT INTO abonnement (date_debut, date_fin, statut, prix_applique, id_client, id_offre) VALUES
    ('2026-01-10', NULL,         'actif',    9.99,   1,  1), -- 1  VPS
    ('2026-01-10', NULL,         'actif',    1.25,   1,  7), -- 2  domaine, pas de serveur
    ('2025-11-01', NULL,         'actif',    85.00,  2,  5), -- 3  dédié, ancien prix
    ('2026-03-15', NULL,         'actif',    4.99,   3,  3), -- 4  mutualisé
    ('2026-02-01', NULL,         'suspendu', 24.99,  4,  2), -- 5  VPS suspendu
    ('2025-09-01', NULL,         'actif',    149.00, 5,  6), -- 6  dédié
    ('2025-09-01', NULL,         'actif',    1.25,   5,  7), -- 7  domaine
    ('2024-06-01', NULL,         'actif',    7.99,   6,  8), -- 8  offre retirée mais conservée
    ('2025-05-01', '2026-04-30', 'resilie',  12.99,  7,  4), -- 9  résilié, serveur libéré
    ('2026-06-01', NULL,         'actif',    9.99,   8,  1), -- 10 VPS
    ('2025-01-01', '2026-01-01', 'resilie',  1.25,   9,  7), -- 11 domaine résilié
    ('2026-07-01', NULL,         'actif',    89.00,  10, 5), -- 12 dédié
    ('2026-08-15', NULL,         'actif',    12.99,  11, 4), -- 13 mutualisé
    ('2026-05-01', NULL,         'actif',    24.99,  7,  2); -- 14 VPS

-- id_abonnement NULL = serveur libre (en stock)
INSERT INTO serveur (nom_hote, adresse_ip, statut, date_mise_en_service, id_datacenter, id_abonnement) VALUES
    ('par-vps-01', '10.0.1.11', 'en_service',   '2025-02-01', 1, 1),    -- 1
    ('par-ded-01', '10.0.1.21', 'en_service',   '2024-09-15', 1, 3),    -- 2
    ('par-mut-01', '10.0.1.31', 'en_service',   '2024-03-10', 1, 4),    -- 3
    ('lys-vps-01', '10.0.2.11', 'en_service',   '2025-01-20', 2, 5),    -- 4
    ('lys-ded-01', '10.0.2.21', 'en_service',   '2024-11-05', 2, 6),    -- 5
    ('lys-vps-02', '10.0.2.12', 'maintenance',  '2023-06-01', 2, 8),    -- 6
    ('mrs-vps-01', '10.0.3.11', 'en_service',   '2025-12-01', 3, 10),   -- 7
    ('mrs-ded-01', '10.0.3.21', 'en_service',   '2026-02-14', 3, 12),   -- 8
    ('par-mut-02', '10.0.1.32', 'en_service',   '2025-07-07', 1, 13),   -- 9
    ('lys-vps-03', '10.0.2.13', 'en_service',   '2025-03-18', 2, 14),   -- 10
    ('par-vps-02', '10.0.1.12', 'en_service',   '2026-04-01', 1, NULL), -- 11 libre
    ('par-vps-03', '10.0.1.13', 'en_service',   '2026-04-01', 1, NULL), -- 12 libre
    ('par-ded-02', '10.0.1.22', 'maintenance',  '2024-01-10', 1, NULL), -- 13 libre
    ('par-mut-03', '10.0.1.33', 'en_service',   '2026-09-01', 1, NULL), -- 14 libre
    ('lys-ded-02', '10.0.2.22', 'en_service',   '2025-10-10', 2, NULL), -- 15 libre
    ('lys-mut-01', '10.0.2.31', 'hors_service', '2022-05-05', 2, NULL), -- 16 libre
    ('mrs-vps-02', '10.0.3.12', 'en_service',   '2026-01-15', 3, NULL), -- 17 libre
    ('mrs-vps-03', '10.0.3.13', 'maintenance',  '2026-01-15', 3, NULL), -- 18 libre
    ('mrs-mut-01', '10.0.3.31', 'en_service',   '2025-08-20', 3, NULL), -- 19 libre
    ('mrs-ded-02', '10.0.3.22', 'en_service',   '2026-06-01', 3, NULL); -- 20 libre

-- Le serveur d'un ticket appartient toujours au client qui l'ouvre (RG6)
INSERT INTO ticket (sujet, description, date_ouverture, priorite, statut, id_client, id_serveur, id_technicien) VALUES
    ('Serveur injoignable',       'Le VPS ne répond plus au ping depuis ce matin.',       '2026-10-26 08:12', 'critique', 'en_cours', 1,  1,    1),
    ('Facture incorrecte',        'Le montant facturé ne correspond pas au devis.',      '2026-10-20 14:30', 'normale',  'ouvert',   2,  NULL, NULL),
    ('Disque presque plein',      'Alerte à 92 % sur la partition /var.',                '2026-10-24 10:05', 'haute',    'ouvert',   2,  2,    2),
    ('Certificat SSL expiré',     'Le certificat du site a expiré hier soir.',           '2026-10-22 09:40', 'haute',    'en_cours', 3,  3,    1),
    ('Réactivation abonnement',   'Je souhaite réactiver mon VPS suspendu.',             '2026-10-18 16:20', 'basse',    'resolu',   4,  4,    3),
    ('Latence réseau élevée',     'Temps de réponse > 800 ms depuis Lyon.',              '2026-10-25 11:00', 'critique', 'ouvert',   5,  5,    3),
    ('Mise à jour du noyau',      'Demande de planification de la mise à jour.',         '2026-09-30 13:15', 'basse',    'ferme',    5,  5,    3),
    ('Migration vers VPS Pro',    'Mon offre Legacy ne suffit plus.',                    '2026-10-15 18:45', 'normale',  'resolu',   6,  6,    3),
    ('Accès SSH refusé',          'Permission denied (publickey) après changement de clé.', '2026-10-27 07:55', 'haute', 'ouvert',   8,  7,    4),
    ('Sauvegardes manquantes',    'Aucune sauvegarde depuis 3 jours sur le dédié.',      '2026-10-23 15:10', 'critique', 'en_cours', 10, 8,    4),
    ('Question sur le DNS',       'Comment pointer mon domaine vers un autre hébergeur ?', '2026-08-02 10:00', 'basse', 'ferme',    9,  NULL, 2),
    ('Erreur 500 sur le site',    'Le site WordPress renvoie une erreur 500.',           '2026-10-26 20:30', 'normale',  'ouvert',   11, 9,    NULL);

COMMIT;
