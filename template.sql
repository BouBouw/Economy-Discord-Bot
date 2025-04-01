-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 31 mars 2025 à 14:43
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `economy`
--

-- --------------------------------------------------------

--
-- Structure de la table `jobs`
--

CREATE TABLE `jobs` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `job_type` int(11) DEFAULT NULL,
  `experiences` int(11) NOT NULL,
  `level` int(11) NOT NULL,
  `created_at` date NOT NULL DEFAULT current_timestamp(),
  `daily_timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `jobs`
--

INSERT INTO `jobs` (`id`, `user_id`, `job_type`, `experiences`, `level`, `created_at`, `daily_timestamp`) VALUES
(1, '853261887520505866', NULL,  0, 0, '2025-03-14', '2025-03-14 19:56:55');

-- --------------------------------------------------------

--
-- Structure de la table `market`
--

CREATE TABLE `market` (
  `id` int(11) NOT NULL,
  `cryptocurrencie_price` decimal(10,2) NOT NULL DEFAULT 10.00,
  `current_price` decimal(10,2) NOT NULL DEFAULT 10.00,
  `total_supply` decimal(15,2) NOT NULL DEFAULT 1000000.00,
  `remaining_supply` decimal(15,2) NOT NULL DEFAULT 1000000.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `market`
--

INSERT INTO `market` (`id`, `cryptocurrencie_price`, `current_price`, `total_supply`, `remaining_supply`, `updated_at`) VALUES
(1, 10.00, 9.47, 1000000.00, 1000003.80, '2025-03-15 20:48:20');

-- --------------------------------------------------------

--
-- Structure de la table `message_sent`
--

CREATE TABLE `message_sent` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `guild_id` varchar(255) NOT NULL,
  `channel_id` varchar(255) NOT NULL,
  `message_count` int(11) NOT NULL DEFAULT 0,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `message_sent`
--

INSERT INTO `message_sent` (`id`, `user_id`, `guild_id`, `channel_id`, `message_count`, `last_update`) VALUES
(1, '853261887520505866', '1209874388074364998', '1209874388523024395', 6, '2025-03-18 12:20:43');

-- --------------------------------------------------------

--
-- Structure de la table `profiles`
--

CREATE TABLE `profiles` (
  `id` int(11) NOT NULL,
  `premium_type` tinyint(1) NOT NULL,
  `language` text NOT NULL DEFAULT 'FR_fr',
  `user_id` varchar(255) NOT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `background_url` varchar(255) DEFAULT NULL,
  `experiences` int(11) NOT NULL DEFAULT 0,
  `level` int(11) NOT NULL DEFAULT 1,
  `balance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `in_bank` decimal(10,2) NOT NULL DEFAULT 150.00,
  `cryptocurrencies` decimal(16,9) NOT NULL DEFAULT 0.000000000,
  `credit_card` int(11) NOT NULL DEFAULT 0,
  `reputations` int(11) NOT NULL DEFAULT 0,
  `boost_int` int(11) NOT NULL DEFAULT 0,
  `boost_duration` datetime DEFAULT NULL,
  `jobs` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `profiles`
--

INSERT INTO `profiles` (`id`, `premium_type`, `language`, `user_id`, `display_name`, `background_url`, `experiences`, `level`, `balance`, `in_bank`, `cryptocurrencies`, `credit_card`, `reputations`, `boost_int`, `boost_duration`, `jobs`) VALUES
(7, 1, 'FR_fr', '853261887520505866', NULL, 'https://www.iclarified.com/images/news/94911/453966/453966.jpg', 9, 1, 0.00, 48.00, 119.000000000, 3, 0, 0, NULL, NULL),
(8, 0, 'FR_fr', '1102638314806313072', NULL, NULL, 0, 1, 0.00, 150.00, 0.000000000, 0, 0, 0, NULL, NULL),
(9, 0, 'FR_fr', '1257602913946042379', NULL, NULL, 0, 1, 107.00, 150.00, 0.000000000, 0, 0, 0, NULL, NULL),
(10, 0, 'FR_fr', '1139117461413830689', NULL, NULL, 0, 1, 0.00, 150.00, 0.000000000, 5, 0, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `transaction_type` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cryptocurrencie` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reason` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `transaction_type`, `amount`, `cryptocurrencie`, `reason`, `created_at`) VALUES
(1, '853261887520505866', 2, 38.72, 0.00, 'Crypto-monnaie', '2025-03-12 22:24:28'),
(2, '853261887520505866', 1, 87.64, 0.00, 'Transfert Bancaire', '2025-03-12 22:24:28'),
(3, '853261887520505866', 1, 46.46, 0.00, 'Transfert Bancaire', '2025-03-12 22:24:28'),
(4, '853261887520505866', 0, 35.85, 0.00, 'Transfert Bancaire', '2025-03-12 22:24:28');

-- --------------------------------------------------------

--
-- Structure de la table `voice_time`
--

CREATE TABLE `voice_time` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `guild_id` varchar(255) NOT NULL,
  `channel_id` varchar(255) NOT NULL,
  `time_spent` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `voice_time`
--

INSERT INTO `voice_time` (`id`, `user_id`, `guild_id`, `channel_id`, `time_spent`, `created_at`) VALUES
(1, '853261887520505866', '1209874388074364998', '1335323528467320852', 4, '2025-03-16 20:52:34'),
(2, '743084844371673219', '1209874388074364998', '1209874388523024396', 27, '2025-03-19 21:06:02');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `market`
--
ALTER TABLE `market`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `message_sent`
--
ALTER TABLE `message_sent`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_guild_channel` (`user_id`,`guild_id`,`channel_id`);

--
-- Index pour la table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `voice_time`
--
ALTER TABLE `voice_time`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `market`
--
ALTER TABLE `market`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `message_sent`
--
ALTER TABLE `message_sent`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `voice_time`
--
ALTER TABLE `voice_time`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

CREATE TABLE `job_types` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `job_grades` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `job_type_id` INT(11) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `rank` INT(11) NOT NULL,
    `salary` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY (`id`)
    FOREIGN KEY (`job_type_id`) REFERENCES `job_types`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
 
ALTER TABLE `jobs`
MODIFY COLUMN `job_type` INT(11) NOT NULL,
ADD COLUMN `grade_id` INT(11) NOT NULL,
ADD CONSTRAINT `fk_job_type` FOREIGN KEY (`job_type`) REFERENCES `job_types`(`id`) ON DELETE CASCADE,
ADD CONSTRAINT `fk_job_grade` FOREIGN KEY (`grade_id`) REFERENCES `job_grades`(`id`) ON DELETE CASCADE;

INSERT INTO `job_types` (`name`) VALUES
('Vendeur'),
('Livreur'),
('Hopital'),
('Développeur web'),
('Educatif'),
('Justice'),
('Média'),
('Science & recherche'),

INSERT INTO `job_grades` (`job_type_id`, `name`, `rank`, `salary`) VALUES
(1, 'Agent de sécurité', 1, 1600),
(1, 'Agent polyvalent', 2, 1800),
(1, 'Caissier', 3, 2000),
(1, 'Employé Drive', 4, 2100),
(1, 'Chef de rayon', 5, 2500),
(1, 'Responsable réception & stockage', 6, 2800),
(1, 'Manager drive & e-commerce', 7, 3200),
(1, 'Adjoint de direction', 8, 3800),
(1, 'Directeur de masagion', 9, 5000),
(1, "Responsable d'entrepôt", 10, 5500),
(1, 'Directeur de la logistique', 11, 6000),
(1, 'Responsable régional', 12, 7000),
(1, 'Reponsanle régioal', 13, 8500),
(1, 'Directeur des opérations', 14, 9500),
(1, 'Directeur commercial', 15, 1000),
(1, 'COO', 16, 12000),
(1, 'PDG', 17, 15000),
(2, 'Livreur de colis', 1, 1200),
(2, 'Livreur Uber Eat', 2, 1210),
(2, 'Livreur Just Eat', 3, 1220),
(2, 'Livreur Deliveroo', 4, 1230),
(2, 'Livreur Glovo', 5, 1240),
(2, 'Livreur Uber Eats', 6, 1250),
(2, 'Livreur Amazon', 7, 1300),
(2, 'Préparateur de colis', 8, 1400),
(2, 'Responsable logistique locale', 9, 1900),
(2, 'Superviseur transport', 10, 2000),
(2, "Responsable des transporteurs", 11, 2200),
(2, 'Directeur de la Logistique', 12, 5000),
(2, 'Responsable des opérations', 13, 5700),
(2, 'Directeur Commercial', 14, 6500),
(2, 'COO', 15, 10000),
(2, 'PDG', 16, 15000),
(3, 'Ambulancier', 1, 1500),
(3, 'Infimier auxiliaire', 2, 1650),
(3, 'Infirmier diplômé', 3, 1900),
(3, 'infirmier urgentiste', 4, 2000),
(3, 'Médecin des urgences', 5, 2200),
(3, 'Interne en médecine', 6, 2500),
(3, 'Médecin généraliste', 7, 4500),
(3, 'Médecin spécialiste', 8, 5000),
(3, 'Chirurgien junior', 9, 6500), 
(3, 'Chirurgien senior', 10, 7000),
(3, 'Chef de service', 11, 7500),
(3, 'Directeur des soins', 12, 7800),
(3, 'Responsable des urgences', 13, 7900),
(3, 'Responsable du personnel', 14, 8000),
(3, 'Responsable logistique & pharmacie', 15, 8100),
(3, 'Directeur médical', 16, 8200),
(3, 'Directeur des ressources humaines', 17, 8300),
(3, 'Directeur médical', 18, 9000),
(3, 'Directeur des opérations hospitalier', 19, 9500),
(3, "Directeur général de l'Hopital", 20, 9700),
(3, 'PDG du groupe hospitalier', 21, 10000),
(4, 'Stagiaire web', 1, 2200),
(4, 'Développeur front-end', 2, 3500),
(4, 'Développeur back-end', 3, 3500),
(4, 'Graphiste web', 4, 3500),
(4, 'Webdesigner', 5, 3500),
(4, 'Ux designer', 6, 3500),
(4, 'Développeur full-sack', 7, 4000),
(4, 'Intégrateur web', 8, 4200),
(4, 'Directeur artistique web', 9, 4500),
(4, 'Rédacteur web', 10, 4500),
(4, 'Spécialiste SEO', 11, 4700),
(4, 'Spécialiste SEA', 12, 4700),
(4, 'Social média manager', 13, 4800),
(4, 'Traffic manager', 14, 4800),
(4, 'Assistant chef de projet', 15, 5200),
(4, 'Chef de projet', 16, 5500),
(4, 'Responsable relation client', 17, 5700),
(4, 'Directeur technique', 18, 6200),
(4, 'Directeur artistique', 19, 6500),
(4, 'Directeur marketing & communication', 20, 7000),
(4, 'Directeur des opérations', 21, 10000),
(4, 'PDG', 22, 15000),
(5, "Assistance d'éducation (surveillant(e))", 1, 1100),
(5, 'Professeur des écoles', 2, 1300),
(5, 'Professeur de collège / Lycée', 3, 1500),
(5, "Conseiller principal d'éducation (CPE)", 4, 2000),
(5, "Documentaliste", 5, 2050),
(6, 'Sécretaire scolaire', 6, 2200),
(6, 'Pscyhologue scolaire', 7, 2300),
(6, 'Infirmier scolaire', 8, 2300),
(6, 'Assistant social scolaire', 9, 2400),
(6, 'Responsable orientation', 10, 2500),
(6, 'Coordinateur pédagogique', 11, 2600),
(6, "Directeur d'école (Primaire)", 12, 5000),
(6, 'Principal de collège', 13, 7500),
(6, 'Proviseur de lycée', 14, 8500),
(6, "Inspecteur de l'éduction", 15, 8500),
(6, "Directeur académique des services de l'éducation nationnale", 16, 9000),
(6, 'Recteur académique', 17, 9500),
(6, "Ministre de l'éducation nationale", 18, 10000),
(7, "Juge des enfants", 1, 2100),
(7, "Juge d'instruction", 2, 2200),
(7, 'Juge aux affaires familiales', 3, 2300),
(7, 'Juge des libertés et de la détention', 4, 2400),
(7, 'Procureur de la république', 5, 2500),
(7, 'Magistrat à la cour de cassation', 6, 2700),
(7, 'Avocat pénaliste', 7, 2900),
(7, 'Avocat en droit des affaires', 8, 3000),
(7, 'Avocat en droit de la famille', 9, 3200),
(7, 'Avocat fiscaliste', 10, 4000),
(7, 'Bâtonnier', '11', 5000),
(7, 'Juriste en entreprise', 12, 5200),
(7, 'Notaire', 13, 5700),
(7, 'Huissier de justice', 14, 5800),
(7, 'Commissaire de justice', 15, 6000),
(7, 'Mandataire judiciaire', 16, 6200),
(7, 'Médiateur judiciaire', 17, 6300),
(7, 'Offier de police judiciaire', 18, 6400),
(7, 'Enquêteur criminel', 19, 6500),
(7, 'Gendarme de section de recherches', 20, 6600),
(7, 'Inspecteur des douanes', 21, 6700),
(7, 'Agent de la DGSI', 22, 6800),
(7, 'Conversateur des hypothèques' 23, 6900),
(7, 'Greffier', 24, 7000),
(7, 'Assureur juridique', 25, 7200),
(7, 'Expert en propriété intellectuelle', 26, 7500),
(7, 'Criminologue', 27, 8000),
(8, 'Journaliste reporter', 1, 1700),
(8, "Journaliste d'investigation", 2, 1800),
(8, 'Présentateur TV / Radio', 3, 2000),
(8, 'Rédacteur en chef', 4, 2100),
(8, "Correspondant à l'étranger", 5, 2200),
(8, 'Chroniqueur', 6, 2300),
(8, 'Réalisateur', 7, 2400),
(8, 'Scénariste', 8, 2500),
(8, 'Monteur vidéo', 9, 2600),
(8, 'Cadreur / Directeur de la photographie', 10, 2700),
(8, 'Ingénieur du son', 11, 3000),
(8, 'Vidéaste web / youtubeur', 12, 1500),
(8, 'Community manager', 13, 3500),
(8, 'Producteur', 14, 3600),
(8, 'Directeur de production', 15, 4000),
(8, 'Assistant réalisteur', 16, 4200),
(8, 'Critique', 17, 4200),
(8, 'Annimateur radio', 18, 4300),
(8, 'Réalisateur radio', 19, 4500),
(8, 'Technicien radio', 20, 4700),
(8, 'Concepteur de podcast', 21, 4800),
(8, 'Voix-Off', 22, 5000),
(8, 'Editeur', 23, 6000),
(8, 'Correcteur / relecteur', 24, 6500),
(8, 'Maquettiste de presse', 25, 8000),
(8, 'Photographe de presse', 26, 8500),
(9, 'Chercheur en physique', 1, 3500),
(9, 'Chercheur en biologie', 2, 3500),
(9, 'Chercheur en chimie', 3, 3500),
(9, 'Chercheur en mathématiques', 4, 3500),
(9, 'Chercheur en informatique', 5, 3500),
(9, 'Chercheur en neurosciences', 6, 3500),
(9, 'Chercheur en psychologie', 7, 3500),
(9, 'Chercheur en sociologie', 8, 3500),
(9, 'Astrophysicien', 9, 3500),
(9, 'Climatologue', 10, 3500),
(9, 'Géologue', 11, 3500),
(9, 'Virologue', 12, 3500),
(9, 'Généticien', 13, 3500),
(9, 'Neuroscientifique', 14, 3500),
(9, 'Pharmacologue', 15, 3500),
(9, 'Ingénieur biomédical', 16, 3500),
(9, 'Chercheur en IA médical', 17, 3500),
(9, 'Ingénieur en énergie renouvable', 18, 3500),
(9, 'Chercheur en cybersécurité', 19, 3500),
(9, 'Chef de laboratoire', 19, 3500);

CREATE TABLE `cities` (
  id SERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL
);

ALTER TABLE cities ADD COLUMN tax_due BIGINT DEFAULT 500;

CREATE TABLE `buildings` (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL, 
  base_income BIGINT NOT NULL, -- revenus de base généré
  upgrade_cost BIGINT NOT NULL -- cout amélioration
);

CREATE TABLE `userBuildings` (
  id SERIAL PRIMARY KEY, 
  city_id INT REFERENCES cities(id) ON DELETE CASCADE, 
  building_id INT REFERENCES buildings(id),
  level INT DEFAULT 1 -- niveau d'amélioration du bâtiment
)

CREATE TABLE `business` (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  base_profit BIGINT NOT NULL, -- profit généré par un cycle
  required_building INT REFERENCES buildings(id) -- batiment nécessaire pour ce business
)

CREATE TABLE `userBusiness` (
  id SERIAL PRIMARY KEY,
  user_building_id INT REFERENCES userBuildings(id) ON DELETE CASCADE, 
  business_id INT REFERENCES business(id),
  level INT DEFAULT 1
)

CREATE TABLE `buildingLevels` (
  id SERIAL PRIMARY KEY,
  building_id INT REFERENCES buildings(id) ON DELETE CASCADE,
  level INT NOT NULL, -- niveau du batiment
  income BIGING NOT NULL, -- revenu généré à ce niveau
  upgrade_cost BIGINT NOT NULL, -- cout pour passer au niveau suivant
);

INSERT INTO buildings (name, base_income, upgrade_cost) VALUES
('Fast Food', 100, 500),
('Marie', 500, 1100),
('Poste de police', 1100, 2000),
('Hopital', 2000, 3000),
('Centre de trie', 200, 600),
('Web Agency', 300, 900),
('Palais de justice', 1500, 3200);

INSERT INTO buildingLevels (building_id, level, income, upgrade_cost) VALUES
(1, 1, 100, 500), -- Niveau 1 
(1, 2, 250, 1200), -- Niveau 2
(1, 3, 500, 2500), -- Niveau 3
(1, 4, 1000, 5000), -- Niveau 4  
(2, 1, 500, 1100),
(2, 2, 900, 1700),
(2, 3, 1600, 2000),
(2, 4, 1900, 2500),
(3, 1, 2000, 2600), 
(3, 2, 2500, 3000),
(3, 3, 2900, 3600), 
(3, 4, 3500, 4000);

CREATE TABLE `taxes` (
  id SERIAL PRIMARY KEY, 
  city_id INT REFERENCES cities(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  due_date TIMESTAMP NOT NULL,
  paid BOOLEAN DEFAULT FALSE
);

INSERT INTO taxes (city_id, amount, due_date, paid)
VALUES(1,500, NOW() + INTERVALE '7 days', FALSE);
-- Appliquer un malus si la taxe n'est pas payée
/* UPDATE profiles 
SET balance = balance - 200 
WHERE id IN (
    SELECT user_id FROM Cities 
    WHERE id IN (SELECT city_id FROM Taxes WHERE paid = FALSE AND due_date < NOW())
);
*/

INSERT INTO buildings (name, base_income, upgrade_cost)
VALUES('Centrale Electrique', 0, 5000),
      ("Station d'eau", 0, 4000);

-- Ajoute de contraintes pour exiger l'électricité et l'eau
/* ALTER TABLE UserBuildings ADD COLUMN active BOOLEAN DEFAULT TRUE;

UPDATE userBuildings
SET active = FALSE 
WHERE city_id IN (
    SELECT city_id FROM userBuildings 
    WHERE building_id NOT IN (SELECT id FROM buildings WHERE name IN ('Centrale Électrique', 'Station d\'Eau'))
);
*/

INSERT INTO buildings (name, base_income, upgrade_cost)
VALUES('Poste de police', 0, 6000);

CREATE TABLE `crimes` (
  id SERIAL PRIMARY KEY,
  city_id INT REFERENCES cities(id) ON DELETE CASCADE,
  stolen_amount BIGINT NOT NULL,
  crime_date TIMESTAMP DEFAULT NOW()
);

INSERT INTO crimes (city_id, stolen_amount)
SELECT city_id, FLOOR(RANDOM() * 1000 + 500)
FROM cities
WHERE id NOT IN (SELECT city_id FROM userBuildings WHERE building_id IN (SELECT id FROM buildings WHERE name == 'Poste de Police'));

/* 
UPDATE profiles
SET balance = balance - ( SELECT SUM(stloen_amount ) FROM crimes WHERE crimes.city_id = cities.id) WHERE id IN (SELECT user_id from cities)
*/
-- CLASSEMENT DES VILLES LES PLUS RICHES
-- SELECT cities.name, profiles.balance
-- FROM cities
-- JOIN profiles ON cities.user_id = profiles.id
-- ORDER BY profiles.balance DESC
-- LIMIT 10;

CREATE TABLE `blackMarket_items` (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  base_price BIGINT NOT NULL,
  risk_level INT CHECK (risk_level BETWEEN 1 AND 100) -- 1 = Faible risque, 100 = Risque Elevé
  rarity INT CHECK (rarity BETWEEN 1 AND 10) -- 1 = Commun, 10 = Ultra rare
);

INSERT INTO blackMarket_items (name, base_price, risk_level, rarity) VALUES
('Faux Billets', 500, 20, 3),
('Drogue', 2000, 80, 7),
('Arme Illégle', 5000, 90, 9),
('Données Volées', 3500, 75, 6);

CREATE TABLE `blackMarket_stock` (
  id SERIAL PRIMARY KEY,
  item_id INT REFERENCES blackMarket_items(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 10,
  price BIGINT NOT NULL,
  last_update TIMESTAMP DEFAULT NOW()
);

-- MISE A JOUR ALEATOIRE DES PRIX ET QUANTITER 
/*
UPDATE blackMarket_stock
SET price = base_price + (RANDOM() * 0.5 * base_price),
    quantity = quantity + FLOOR(RANDOM() * 5 - 2)
FROM blackMarket_items 
WHERE blackMarket_stock.item_id = blackMarket_items.id;
*/

CREATE TABLE `blackMarket_transactions` (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES profiles(user_id) ON DELETE CASCADE,
  item_id INT REFERENCES blackMarket_items(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  total_price BIGINT NOT NULL,
  transaction_date TIMESTAMP DEFAULT NOW()
);

INSERT INTO blackMarket_transactions (user_id, item_id, quantity, total_price)
SELECT 1, 2, 3 (SELECT price * 3 FROM blackMarket_stock WHERE item_id = 2);

SELECT * FROM blackMarket_transactions
JOIN blackMarket_items ON blackMarket_transactions.item_id = blackMarket_items.id
WHERE user_id = 1 AND RANDOM() < (risk_level / 100.0);

CREATE TABLE `moneyLaundering` (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES profiles(user_id) ON DELETE CASCADE,
  dirty_money BIGINT NOT NULL,
  converted_money BIGINT DEFAULT 0,
  status VARCHAR(255) CHECK (status IN ('En cours', 'Echec', 'Réussi')),
  laundering_date TIMESTAMP DEFAULT NOW()
);

-- UPDATE moneyLaundering
-- SET converted_money = dirty_money * (0.7 + RANDOM() * 0.3),
--     status = CASE 
--       WHEN RANDOM() < 0.8 THEN 'Réussi'
--       ELSE 'Echec'
--     END
-- WHERE status = 'En cours';

CREATE TABLE `drugFarms` (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  grow_time INTERVAL NOT NULL,
  yield_min INT NOT NULL,
  yield_max INT NOT NULL,
  risk_level INT CHECK (risk_level BETWEEN 1 AND 100)
);

INSERT INTO drugFarms (name, grow_time, yield_min, yield_max, risk_level) VALUES
('Canabis', '24 Heures', 5, 15, 30),
('Coca', '48 Heures', 10, 25, 50),
('Pavot (Opium)', '72 Heures', 15, 30, 70);

CREATE TABLE `userFarms` (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES profiles(user_id) ON DELETE CASCADE,
  farm_id INT REFERENCES drugFarms(id) ON DELETE CASCADE,
  planted_at TIMESTAMP DEFAULT NOW(),
  ready_at TIMESTAMP GENERATED ALWAYS AS (planted_at + (SELECT grow_time FROM drugFarms.id = farm_id)) STORED,
  harvested BOOLEAN DEFAULT FALSE
);

INSERT INTO userFarms (user_id, farm_id, planted_at) VALUES
(1, (SELECT id FROM drugFarms WHERE name = 'Canabis'), NOW());

-- UPDATE userFarms
-- SET harvested = TRUE
-- WHERE user_id = 1 AND ready_at <= NOW() AND harvested = FALSE;

-- INSERT INTO userInventory (user_id, item_name, quantity)
-- SELECT user_id, (SELECT name FROM drugFarms WHERE id = farm_id),
--   FLOOR(RANDOM() * (yield_max - yield_min) + yield_min)
-- FROM userFarms
-- WHERE user_id = 1 AND harvested = TRUE;

CREATE TABLE `drugDeals` (
  id SERIAL PRIMARY KEY,
  seller_id INT REFERENCES profiles(user_id) ON DELETE CASCADE,
  buyer_type VARCHAR(50) CHECK (buyer_type IN ('PNJ', 'Joueur')),
  buyer_id INT NULL,
  drug_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  total_price BIGINT NOT NULL,
  risk_level INT CHECK (risk_level BETWEEN 1 AND 100),
  deal_date TIMESTAMP DEFAULT NOW()
);

-- INSERT INTRO drugDeal (seller_id, buyer_type, drug_name, quantity, total_price, risk_level)
-- SELECT 1, 'PNJ', item_name, 10 (10 * 1500), 50
-- FROM userInventory
-- WHERE user_id = 1 AND item_name = 'Coca';

-- DELETE FROM userInventory WHERE user_id = 1 AND item_name = 'Coca' AND quantity >= 10;

-- SELECT * FROM drugDeal
-- WHERE seller_id = 1 AND RANDOM() < (risk_level / 100.0)

CREATE TABLE `hideouts` (
  id SERIAL PRIMARY KEY,
  ower_id INT REFERENCES profiles(user_id) ON DELETE CASCADE,
  capacity INT NOT NULL,
  security_level INT CHECK (security_level BETWEEN 1 AND 100) DEFAULT 50 -- Protège des raids policiers
);

INSERT INTO hideout_invetory (hideout_id, item_name, quantity)
VALUES (1, 'Coca, 20')

CREATE TABLE `drugDealers` (
  id SERIAL PRIMARY KEY,
  owern_id INT REFERENCES profiles(user_id) ON DELETE CASCADE,
  efficiency FLOAT CHECK (efficiency BETWEEN 0.5 AND 2.0) -- Influence le profit
  risk_level INT CHECK (risk_level BETWEEN 1 AND 100)
);

-- UPDATE userInventory
-- SET quantity = quantity - 5
-- WHERE user_id (SELECT owner_id FROM drugDealers WHERE id = 1)
-- AND item_name = 'Canabis';

-- UPDATE profiles
-- SET balance = balance + (5 * 1200 * (SELECT efficiency FROM drugDealers FROM drugDealers WHERE id = 1))
-- WHERE id = (SELECT owner_id FROM drugDealers WHERE id = 1);