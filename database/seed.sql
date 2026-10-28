-- jeu essai

SET client_encoding = 'UTF8'; -- accents

TRUNCATE ticket, abonnement, technicien, serveur, offre, client, datacenter RESTART IDENTITY CASCADE;

-- datacenters
INSERT INTO datacenter (nom, ville) VALUES
  ('PAR-1', 'Paris'),        -- id
  ('RBX-1', 'Roubaix'),      -- id
  ('LYS-1', 'Lyon'),         -- id
  ('SXB-1', 'Strasbourg');   -- id

-- techniciens
INSERT INTO technicien (nom, prenom, email, datacenter_id) VALUES
  ('Dubois',  'Julien',  'julien.dubois@paleonis.fr',   1),  -- id
  ('Mercier', 'Camille', 'camille.mercier@paleonis.fr', 2),  -- id
  ('Lambert', 'Nicolas', 'nicolas.lambert@paleonis.fr', 3),  -- id
  ('Roux',    'Inès',    'ines.roux@paleonis.fr',       4),  -- id
  ('Faure',   'Thomas',  'thomas.faure@paleonis.fr',    1);  -- id

-- offres
INSERT INTO offre (nom, categorie, prix_mensuel_ht, en_vente) VALUES
  ('VPS Starter',          'vps',        5.99,  TRUE),   -- id
  ('VPS Pro',              'vps',       14.99,  TRUE),   -- id
  ('VPS Business',         'vps',       29.99,  TRUE),   -- id
  ('Mutualisé Perso',      'mutualise',  2.99,  TRUE),   -- id
  ('Mutualisé Pro',        'mutualise',  7.99,  TRUE),   -- id
  ('Dédié Essential',      'dedie',     69.00,  TRUE),   -- id
  ('Dédié Performance',    'dedie',    149.00,  TRUE),   -- id
  ('Domaine .fr',          'domaine',    0.99,  TRUE),   -- id
  ('Domaine .com',         'domaine',    1.25,  TRUE),   -- id
  ('VPS Legacy',           'vps',        9.99,  FALSE);  -- id

-- clients
INSERT INTO client (type, nom, email, telephone, siret, date_inscription) VALUES
  ('particulier', 'Alice Martin',                      'alice.martin@gmail.com',       '0612345678',        NULL,             '2024-01-15'), -- id
  ('entreprise',  'Boulangerie Durand SARL',           'contact@boulangerie-durand.fr', '0478123456',       '41234567800012', '2023-06-02'), -- id
  ('particulier', 'Karim Benali',                      'karim.benali@outlook.fr',      '0698765432',        NULL,             '2022-04-20'), -- id
  ('entreprise',  'Nexa Conseil SAS',                  'it@nexa-conseil.fr',           '0144556677',        '81234567900025', '2024-03-28'), -- id
  ('particulier', 'Sophie Lefèvre',                    'sophie.lefevre@free.fr',       NULL,                NULL,             '2025-02-08'), -- id
  ('entreprise',  'Atelier Moreau',                    'admin@atelier-moreau.fr',      '0320112233',        '52345678100031', '2024-09-10'), -- id
  ('particulier', 'Lucas Petit',                       'lucas.petit@gmail.com',        '+33 7 81 22 33 44', NULL,             '2025-03-11'), -- id
  ('entreprise',  'Verdi Logistique SA',               'dsi@verdi-logistique.com',     '0388774455',        '39876543200047', '2023-11-15'), -- id
  ('particulier', 'Emma Rousseau',                     'emma.rousseau@laposte.net',    '0655443322',        NULL,             '2023-01-28'), -- id
  ('entreprise',  'Studio Pixelia',                    'hello@pixelia.studio',         '0972334455',        '89012345600018', '2025-05-18'), -- id
  ('particulier', 'Hugo Garnier',                      'hugo.garnier@proton.me',       NULL,                NULL,             '2024-07-01'), -- id
  ('entreprise',  'Clinique vétérinaire des Tilleuls', 'accueil@veto-tilleuls.fr',     '0299887766',        '44455566600029', '2024-09-25'), -- id
  ('particulier', 'Chloé Fontaine',                    'chloe.fontaine@gmail.com',     '0611223344',        NULL,             '2026-09-30'), -- id
  ('entreprise',  'Kodiak Labs',                       'contact@kodiak-labs.io',       NULL,                '75312468900014', '2022-12-15'); -- id

-- serveurs
INSERT INTO serveur (nom_hote, adresse_ip, statut, date_mise_en_service, datacenter_id) VALUES
  -- paris
  ('par1-vps01.paleonis.net', '203.0.113.11',   'en_service',   '2022-03-01', 1), -- id
  ('par1-vps02.paleonis.net', '203.0.113.12',   'en_service',   '2022-03-01', 1), -- id
  ('par1-ded01.paleonis.net', '203.0.113.21',   'en_service',   '2021-09-15', 1), -- id
  ('par1-vps03.paleonis.net', '203.0.113.13',   'en_service',   '2023-01-10', 1), -- id
  ('par1-vps04.paleonis.net', '203.0.113.14',   'en_service',   '2024-02-20', 1), -- id
  ('par1-ded02.paleonis.net', '203.0.113.22',   'maintenance',  '2021-09-15', 1), -- id
  ('par1-ded03.paleonis.net', '203.0.113.23',   'hors_service', '2019-05-01', 1), -- id
  -- roubaix
  ('rbx1-web01.paleonis.net', '198.51.100.11',  'en_service',   '2020-11-02', 2), -- id
  ('rbx1-ded01.paleonis.net', '198.51.100.21',  'en_service',   '2022-06-30', 2), -- id
  ('rbx1-vps01.paleonis.net', '198.51.100.31',  'en_service',   '2023-04-12', 2), -- id
  ('rbx1-vps02.paleonis.net', '198.51.100.32',  'en_service',   '2024-08-01', 2), -- id
  ('rbx1-web02.paleonis.net', '198.51.100.12',  'maintenance',  '2020-11-02', 2), -- id
  ('rbx1-ded02.paleonis.net', '198.51.100.22',  'en_service',   '2025-01-20', 2), -- id
  -- lyon
  ('lys1-web01.paleonis.net', '192.0.2.11',     'en_service',   '2021-02-14', 3), -- id
  ('lys1-vps01.paleonis.net', '192.0.2.31',     'en_service',   '2023-10-05', 3), -- id
  ('lys1-web02.paleonis.net', '192.0.2.12',     'en_service',   '2021-02-14', 3), -- id
  ('lys1-vps02.paleonis.net', '192.0.2.32',     'en_service',   '2024-11-18', 3), -- id
  ('lys1-ded01.paleonis.net', '192.0.2.21',     'maintenance',  '2022-12-01', 3), -- id
  ('lys1-vps03.paleonis.net', '192.0.2.33',     'en_service',   '2025-06-01', 3), -- id
  -- strasbourg
  ('sxb1-ded01.paleonis.net', '2001:db8:10::21', 'en_service',   '2023-03-03', 4), -- id
  ('sxb1-ded02.paleonis.net', '2001:db8:10::22', 'en_service',   '2023-03-03', 4), -- id
  ('sxb1-vps01.paleonis.net', '2001:db8:10::31', 'en_service',   '2022-09-09', 4), -- id
  ('sxb1-vps02.paleonis.net', '2001:db8:10::32', 'maintenance',  '2024-04-04', 4), -- id
  ('sxb1-ded03.paleonis.net', '2001:db8:10::23', 'hors_service', '2019-12-12', 4); -- id

-- abonnements
INSERT INTO abonnement (client_id, offre_id, serveur_id, date_debut, date_fin, statut, prix_applique) VALUES
  ( 1,  1,    1, '2024-01-20', NULL,         'actif',      4.99), -- id
  ( 1,  8, NULL, '2024-01-20', NULL,         'actif',      0.99), -- id
  ( 2,  5,    8, '2023-06-10', NULL,         'actif',      7.99), -- id
  ( 2,  8, NULL, '2023-06-10', NULL,         'actif',      0.99), -- id
  ( 3,  2,    2, '2024-03-01', NULL,         'actif',     14.99), -- id
  ( 3, 10,    3, '2022-05-01', '2024-02-28', 'resilie',    9.99), -- id
  ( 4,  7,    3, '2024-04-01', NULL,         'actif',    149.00), -- id
  ( 4,  9, NULL, '2024-04-01', NULL,         'actif',      1.25), -- id
  ( 5,  4,   14, '2025-02-10', NULL,         'suspendu',   2.99), -- id
  ( 6,  6,    9, '2024-09-15', NULL,         'actif',     65.00), -- id
  ( 6,  3,   15, '2025-01-05', NULL,         'actif',     29.99), -- id
  ( 7,  1,   10, '2025-03-12', NULL,         'suspendu',   5.99), -- id
  ( 8,  7,   20, '2023-11-20', NULL,         'actif',    139.00), -- id
  ( 8,  7,   21, '2023-11-20', NULL,         'actif',    139.00), -- id
  ( 8,  9, NULL, '2023-11-20', NULL,         'actif',      1.25), -- id
  ( 9,  4,   16, '2023-02-01', '2025-01-31', 'resilie',    2.49), -- id
  (10,  2,    4, '2025-05-20', NULL,         'actif',     14.99), -- id
  (10,  8, NULL, '2025-05-20', '2027-05-19', 'actif',      0.99), -- id
  (11,  6,    6, '2024-07-07', NULL,         'actif',     69.00), -- id
  (12,  5,   22, '2024-10-01', NULL,         'actif',      7.99), -- id
  (12,  8, NULL, '2024-10-01', NULL,         'actif',      0.99), -- id
  (14,  1,   22, '2023-01-10', '2024-06-30', 'resilie',    4.99), -- id
  (14,  9, NULL, '2023-01-10', '2024-06-30', 'resilie',    1.25); -- id

-- tickets
INSERT INTO ticket (client_id, serveur_id, technicien_id, sujet, description, date_ouverture, priorite, statut) VALUES
  ( 1,    1,    1, 'VPS inaccessible en SSH',
    'Connexion refusée sur le port 22 depuis hier soir.', '2026-10-20 09:12', 'haute', 'en_cours'),          -- id
  ( 2,    8,    2, 'Site très lent depuis ce matin',
    'Les pages mettent plus de 10 secondes à s''afficher.', '2026-10-27 08:45', 'normale', 'ouvert'),         -- id
  ( 4,    3,    1, 'Disque plein sur le serveur dédié',
    'La partition /var est pleine, la base de données ne démarre plus.', '2026-10-27 22:03', 'critique', 'en_cours'), -- id
  ( 4, NULL, NULL, 'Question sur la facture d''octobre',
    'Le montant ne correspond pas à notre devis.', '2026-10-26 14:30', 'basse', 'ouvert'),                   -- id
  ( 6,    9,    2, 'Panne d''alimentation',
    'Le serveur s''est éteint brutalement à 3 h.', '2026-09-12 03:20', 'critique', 'resolu'),                -- id
  ( 8,   20,    4, 'Latence réseau élevée',
    'Ping moyen à 180 ms depuis nos entrepôts.', '2026-10-25 11:00', 'haute', 'en_cours'),                  -- id
  ( 8,   21,    4, 'Mise à jour du noyau',
    'Demande de planification d''une fenêtre de maintenance.', '2026-08-03 10:15', 'normale', 'ferme'),      -- id
  ( 3,    2,    1, 'Renouvellement du certificat SSL',
    'Le certificat expire dans 5 jours.', '2026-10-02 16:40', 'normale', 'resolu'),                          -- id
  (11,    6,    5, 'Serveur en maintenance depuis 3 jours',
    'Quand mon serveur sera-t-il de nouveau disponible ?', '2026-10-24 07:55', 'haute', 'en_cours'),         -- id
  ( 5, NULL, NULL, 'Réactivation de mon hébergement suspendu',
    'J''ai régularisé mon paiement.', '2026-10-28 08:00', 'normale', 'ouvert'),                              -- id
  (12,   22,    4, 'Restauration d''une sauvegarde',
    'Besoin de restaurer la sauvegarde du 15 juillet.', '2026-07-19 13:10', 'basse', 'ferme'),              -- id
  (10,    4,    1, 'Migration vers une offre supérieure',
    'Nous voulons passer sur VPS Business sans coupure.', '2026-10-15 15:25', 'basse', 'en_cours'),         -- id
  ( 9, NULL,    3, 'Récupération des données de l''ancien hébergement',
    'Je souhaite une archive de mon site avant résiliation.', '2025-02-03 10:00', 'normale', 'ferme'),      -- id
  ( 1,    1,    1, 'Redémarrage impossible depuis le panel',
    'Le bouton de redémarrage renvoie une erreur 500.', '2026-10-28 07:30', 'critique', 'ouvert');          -- id
