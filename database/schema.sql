-- =====================================================================
-- PaLeonis - schéma PostgreSQL (TP 3)
-- Rejouable : on supprime tout puis on recrée.
-- Les contraintes métier (unicité, valeurs autorisées, prix positif)
-- sont portées par la base elle-même.
-- =====================================================================

SET client_encoding = 'UTF8'; -- fichiers en UTF-8 (indispensable sous Windows)

DROP TABLE IF EXISTS ticket     CASCADE;
DROP TABLE IF EXISTS serveur    CASCADE;
DROP TABLE IF EXISTS abonnement CASCADE;
DROP TABLE IF EXISTS technicien CASCADE;
DROP TABLE IF EXISTS datacenter CASCADE;
DROP TABLE IF EXISTS offre      CASCADE;
DROP TABLE IF EXISTS client     CASCADE;

-- RG1 : particulier ou entreprise, email unique, SIRET pour les entreprises
CREATE TABLE client (
    id               SERIAL PRIMARY KEY,
    type_client      VARCHAR(12)  NOT NULL
                     CHECK (type_client IN ('particulier', 'entreprise')),
    nom              VARCHAR(100) NOT NULL,
    email            VARCHAR(255) NOT NULL UNIQUE,
    telephone        VARCHAR(20),
    date_inscription DATE         NOT NULL DEFAULT CURRENT_DATE,
    siret            CHAR(14),
    CONSTRAINT chk_client_siret CHECK (
        (type_client = 'entreprise'  AND siret IS NOT NULL) OR
        (type_client = 'particulier' AND siret IS NULL)
    )
);

-- RG2 : catégorie fermée, prix jamais négatif, retrait de la vente sans suppression
CREATE TABLE offre (
    id              SERIAL PRIMARY KEY,
    nom             VARCHAR(100)  NOT NULL,
    categorie       VARCHAR(20)   NOT NULL
                    CHECK (categorie IN ('vps', 'mutualise', 'dedie', 'domaine')),
    prix_mensuel_ht NUMERIC(10,2) NOT NULL CHECK (prix_mensuel_ht >= 0),
    en_vente        BOOLEAN       NOT NULL DEFAULT TRUE
);

-- RG4
CREATE TABLE datacenter (
    id    SERIAL PRIMARY KEY,
    nom   VARCHAR(100) NOT NULL,
    ville VARCHAR(100) NOT NULL
);

-- RG7 : chaque technicien est rattaché à un datacenter
CREATE TABLE technicien (
    id            SERIAL PRIMARY KEY,
    nom           VARCHAR(50)  NOT NULL,
    prenom        VARCHAR(50)  NOT NULL,
    email_pro     VARCHAR(255) NOT NULL UNIQUE,
    id_datacenter INT          NOT NULL
                  REFERENCES datacenter(id) ON DELETE RESTRICT
);

-- RG3 : l'abonnement garde le prix appliqué ; RG8 : on ne supprime pas un client
-- qui a des abonnements (historique conservé) -> ON DELETE RESTRICT
CREATE TABLE abonnement (
    id            SERIAL PRIMARY KEY,
    date_debut    DATE          NOT NULL DEFAULT CURRENT_DATE,
    date_fin      DATE,
    statut        VARCHAR(10)   NOT NULL DEFAULT 'actif'
                  CHECK (statut IN ('actif', 'suspendu', 'resilie')),
    prix_applique NUMERIC(10,2) NOT NULL CHECK (prix_applique >= 0),
    id_client     INT           NOT NULL REFERENCES client(id) ON DELETE RESTRICT,
    id_offre      INT           NOT NULL REFERENCES offre(id)  ON DELETE RESTRICT,
    CONSTRAINT chk_abonnement_dates CHECK (date_fin IS NULL OR date_fin >= date_debut)
);

-- RG4 + RG5 : hôte et IP uniques ; libre si id_abonnement IS NULL ;
-- UNIQUE sur id_abonnement = un serveur pour un seul abonnement (et inversement)
CREATE TABLE serveur (
    id                   SERIAL PRIMARY KEY,
    nom_hote             VARCHAR(100) NOT NULL UNIQUE,
    adresse_ip           INET         NOT NULL UNIQUE,
    statut               VARCHAR(15)  NOT NULL DEFAULT 'en_service'
                         CHECK (statut IN ('en_service', 'maintenance', 'hors_service')),
    date_mise_en_service DATE         NOT NULL,
    id_datacenter        INT          NOT NULL
                         REFERENCES datacenter(id) ON DELETE RESTRICT,
    id_abonnement        INT          UNIQUE
                         REFERENCES abonnement(id) ON DELETE SET NULL
);

-- RG6 + RG7 : serveur et technicien facultatifs
CREATE TABLE ticket (
    id             SERIAL PRIMARY KEY,
    sujet          VARCHAR(150) NOT NULL,
    description    TEXT         NOT NULL,
    date_ouverture TIMESTAMP    NOT NULL DEFAULT now(),
    priorite       VARCHAR(10)  NOT NULL DEFAULT 'normale'
                   CHECK (priorite IN ('basse', 'normale', 'haute', 'critique')),
    statut         VARCHAR(10)  NOT NULL DEFAULT 'ouvert'
                   CHECK (statut IN ('ouvert', 'en_cours', 'resolu', 'ferme')),
    id_client      INT NOT NULL REFERENCES client(id)     ON DELETE CASCADE,
    id_serveur     INT          REFERENCES serveur(id)    ON DELETE SET NULL,
    id_technicien  INT          REFERENCES technicien(id) ON DELETE SET NULL
);
