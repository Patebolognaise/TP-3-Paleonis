-- =============================================================
-- PaLeonis : schéma PostgreSQL (rejouable)
-- Chargement : npm run db:reset, ou psql -U paleonis -d paleonis -f database/schema.sql
-- =============================================================

SET client_min_messages = warning; -- masque les NOTICE des DROP ... IF EXISTS

DROP TABLE IF EXISTS ticket, abonnement, technicien, serveur, offre, client, datacenter CASCADE;
DROP FUNCTION IF EXISTS bloquer_suppression_client_en_cours() CASCADE;

-- RG4 : datacenters
CREATE TABLE datacenter (
  id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nom    VARCHAR(50)  NOT NULL,
  ville  VARCHAR(100) NOT NULL,
  CONSTRAINT datacenter_nom_unique UNIQUE (nom)
);

-- RG1 : clients (particuliers et entreprises dans la même table)
CREATE TABLE client (
  id                INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type              VARCHAR(11)  NOT NULL,
  nom               VARCHAR(150) NOT NULL,
  email             VARCHAR(255) NOT NULL,
  telephone         VARCHAR(20),
  siret             CHAR(14),
  date_inscription  DATE NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT client_type_check       CHECK (type IN ('particulier', 'entreprise')),
  CONSTRAINT client_nom_non_vide     CHECK (btrim(nom) <> ''),
  CONSTRAINT client_email_format     CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT client_telephone_format CHECK (telephone ~ '^\+?[0-9][0-9 .-]{5,19}$'),
  CONSTRAINT client_siret_format     CHECK (siret ~ '^[0-9]{14}$'),
  -- un SIRET pour les entreprises, et seulement pour elles
  CONSTRAINT client_siret_entreprise CHECK ((type = 'entreprise') = (siret IS NOT NULL)),
  CONSTRAINT client_siret_unique     UNIQUE (siret)
);
-- Deux clients ne peuvent pas avoir le même email, quelle que soit la casse
CREATE UNIQUE INDEX client_email_unique ON client (lower(email));

-- RG2 : catalogue
CREATE TABLE offre (
  id               INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nom              VARCHAR(100)  NOT NULL,
  categorie        VARCHAR(20)   NOT NULL,
  prix_mensuel_ht  NUMERIC(10,2) NOT NULL,
  en_vente         BOOLEAN       NOT NULL DEFAULT TRUE,
  CONSTRAINT offre_nom_unique      UNIQUE (nom),
  CONSTRAINT offre_nom_non_vide    CHECK (btrim(nom) <> ''),
  CONSTRAINT offre_categorie_check CHECK (categorie IN ('vps', 'mutualise', 'dedie', 'domaine')),
  CONSTRAINT offre_prix_positif    CHECK (prix_mensuel_ht >= 0)
);

-- RG4, RG5 : serveurs
CREATE TABLE serveur (
  id                    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nom_hote              VARCHAR(253) NOT NULL,
  adresse_ip            INET         NOT NULL,
  statut                VARCHAR(12)  NOT NULL DEFAULT 'en_service',
  date_mise_en_service  DATE         NOT NULL,
  datacenter_id         INT          NOT NULL REFERENCES datacenter (id) ON DELETE RESTRICT,
  CONSTRAINT serveur_nom_hote_unique   UNIQUE (nom_hote),
  CONSTRAINT serveur_adresse_ip_unique UNIQUE (adresse_ip),
  CONSTRAINT serveur_statut_check      CHECK (statut IN ('en_service', 'maintenance', 'hors_service'))
);

-- RG7 : techniciens
CREATE TABLE technicien (
  id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nom            VARCHAR(100) NOT NULL,
  prenom         VARCHAR(100) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  datacenter_id  INT          NOT NULL REFERENCES datacenter (id) ON DELETE RESTRICT,
  CONSTRAINT technicien_email_unique UNIQUE (email),
  CONSTRAINT technicien_email_pro    CHECK (email ~ '^[^@\s]+@paleonis\.fr$')
);

-- RG3, RG5 : abonnements (souscription d'un client à une offre)
CREATE TABLE abonnement (
  id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id      INT           NOT NULL REFERENCES client (id)  ON DELETE CASCADE,
  offre_id       INT           NOT NULL REFERENCES offre (id)   ON DELETE RESTRICT,
  serveur_id     INT                    REFERENCES serveur (id) ON DELETE RESTRICT,
  date_debut     DATE          NOT NULL DEFAULT CURRENT_DATE,
  date_fin       DATE,
  statut         VARCHAR(10)   NOT NULL DEFAULT 'actif',
  prix_applique  NUMERIC(10,2) NOT NULL,
  CONSTRAINT abonnement_statut_check     CHECK (statut IN ('actif', 'suspendu', 'resilie')),
  CONSTRAINT abonnement_prix_positif     CHECK (prix_applique >= 0),
  CONSTRAINT abonnement_dates_coherentes CHECK (date_fin IS NULL OR date_fin >= date_debut),
  CONSTRAINT abonnement_resilie_date_fin CHECK (statut <> 'resilie' OR date_fin IS NOT NULL)
);
-- RG5 : un serveur n'est attribué qu'à un seul abonnement en cours à la fois.
-- Les abonnements résiliés gardent leur serveur_id (historique) sans bloquer la réattribution.
CREATE UNIQUE INDEX abonnement_serveur_en_cours_unique
  ON abonnement (serveur_id) WHERE statut <> 'resilie';
CREATE INDEX abonnement_client_idx ON abonnement (client_id);

-- RG6, RG7 : tickets de support
CREATE TABLE ticket (
  id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id       INT          NOT NULL REFERENCES client (id)     ON DELETE CASCADE,
  serveur_id      INT                   REFERENCES serveur (id)    ON DELETE SET NULL,
  technicien_id   INT                   REFERENCES technicien (id) ON DELETE SET NULL,
  sujet           VARCHAR(150) NOT NULL,
  description     TEXT         NOT NULL,
  date_ouverture  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  priorite        VARCHAR(8)   NOT NULL DEFAULT 'normale',
  statut          VARCHAR(8)   NOT NULL DEFAULT 'ouvert',
  CONSTRAINT ticket_sujet_non_vide       CHECK (btrim(sujet) <> ''),
  CONSTRAINT ticket_description_non_vide CHECK (btrim(description) <> ''),
  CONSTRAINT ticket_priorite_check       CHECK (priorite IN ('basse', 'normale', 'haute', 'critique')),
  CONSTRAINT ticket_statut_check         CHECK (statut IN ('ouvert', 'en_cours', 'resolu', 'ferme'))
);
CREATE INDEX ticket_technicien_idx ON ticket (technicien_id);
CREATE INDEX ticket_client_idx ON ticket (client_id);

-- RG8 : on ne supprime jamais un client qui a encore un abonnement en cours
-- (actif ou suspendu). La base le garantit, même en dehors de l'API.
CREATE FUNCTION bloquer_suppression_client_en_cours() RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM abonnement WHERE client_id = OLD.id AND statut <> 'resilie') THEN
    RAISE EXCEPTION 'Le client % a encore un abonnement en cours (RG8)', OLD.id
      USING ERRCODE = 'restrict_violation', CONSTRAINT = 'client_abonnement_en_cours';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER client_rg8_suppression
  BEFORE DELETE ON client
  FOR EACH ROW EXECUTE FUNCTION bloquer_suppression_client_en_cours();
