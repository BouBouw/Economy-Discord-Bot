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

INSERT INTO `job_grades` (`job_type_id`, `name`, `rank`) VALUES
(1, 'Agent de sécurité', 1),
(1, 'Agent polyvalent', 2),
(1, 'Caissier', 3),
(1, 'Employé Drive', 4),
(1, 'Chef de rayon', 5),
(1, 'Responsable réception & stockage', 6),
(1, 'Manager drive & e-commerce', 7),
(1, 'Adjoint de direction', 8),
(1, 'Directeur de masagion', 9),
(1, "Responsable d'entrepôt", 11),
(1, 'Directeur de la logistique', 12),
(1, 'Responsable régional', 13),
(1, 'Reponsanle régioal', 14),
(1, 'Directeur des opérations', 15),
(1, 'Directeur commercial', 16),
(1, 'COO', 17),
(1, 'PDG', 18),
(2, 'Livreur de colis', 1),
(2, 'Livreur Uber Eat', 2),
(2, 'Livreur Just Eat', 3),
(2, 'Livreur Deliveroo', 4),
(2, 'Livreur Glovo', 5),
(2, 'Livreur Uber Eats', 6),
(2, 'Livreur Amazon', 7),
(2, 'Préparateur de colis', 8),
(2, 'Responsable logistique locale', 9),
(2, 'Superviseur transport', 10),
(2, "Responsable des transporteurs", 11),
(2, 'Directeur de la Logistique', 12),
(2, 'Responsable des opérations', 13),
(2, 'Directeur Commercial', 14),
(2, 'COO', 15),
(2, 'PDG', 16),
(3, 'Ambulancier', 1),
(3, 'Infimier auxiliaire', 2),
(3, 'Infirmier diplômé', 3),
(3, 'infirmier urgentiste', 4),
(3, 'Médecin des urgences', 5),
(3, 'Interne en médecine', 6),
(3, 'Médecin généraliste', 7),
(3, 'Médecin spécialiste', 8),
(3, 'Chirurgien junior', 9), 
(3, 'Chirurgien senior', 10),
(3, 'Chef de service', 11),
(3, 'Directeur des soins', 12),
(3, 'Responsable des urgences', 13),
(3, 'Responsable du personnel', 14),
(3, 'Responsable logistique & pharmacie', 15),
(3, 'Directeur médical', 16),
(3, 'Directeur des ressources humaines', 17),
(3, 'Directeur médical', 18),
(3, 'Directeur des opérations hospitalier', 19),
(3, "Directeur général de l'Hopital", 20),
(3, 'PDG du groupe hospitalier', 21),
(4, 'Stagiaire web', 1),
(4, 'Développeur front-end', 2),
(4, 'Développeur back-end', 3),
(4, 'Développeur full-sack', 4),
(4, 'Intégrateur web', 5),
(4, 'Graphiste web', 6),
(4, 'Webdesigner', 7),
(4, 'Ux designer', 8),
(4, 'Directeur artistique web', 9),
(4, 'Rédacteur web', 10),
(4, 'Spécialiste SEO', 11),
(4, 'Spécialiste SEA', 12),
(4, 'Social média manager', 13),
(4, 'Traffic manager', 14),
(4, 'Assistant chef de projet', 15),
(4, 'Chef de projet', 16),
(4, 'Responsable relation client', 17),
(4, 'Directeur technique', 18),
(4, 'Directeur artistique', 19),
( 4, 'Directeur marketing & communication', 20),
(4, 'Directeur des opérations', 21),
(4, 'PDG', 22),
(5, "Assistance d'éducation (surveillant(e))", 1),
(5, 'Professeur des écoles', 2),
(5, 'Professeur de collège / Lycée', 3),
(5, "Conseiller principal d'éducation (CPE)", 4),
(5, "Documentaliste", 5),
(6, 'Sécretaire scolaire', 6),
(6, 'Pscyhologue scolaire', 7),
(6, 'Infirmier scolaire', 8),
(6, 'Assistant social scolaire', 9),
(6, 'Responsable orientation', 10),
(6, 'Coordinateur pédagogique', 11),
(6, "Directeur d'école (Primaire)", 12),
(6, 'Principal de collège', 13),
(6, 'Proviseur de lycée', 14),
(6, "Inspecteur de l'éduction", 15),
(6, "Directeur académique des services de l'éducation nationnale", 16),
(6, 'Recteur académique', 17),
(6, "Ministre de l'éducation nationale", 18),
(7, "Juge des enfants", 1),
(7, "Juge d'instruction", 2),
(7, 'Juge aux affaires familiales', 3),
(7, 'Juge des libertés et de la détention', 4),
(7, 'Procureur de la république', 5),
(7, 'Magistrat à la cour de cassation', 6),
(7, 'Avocat pénaliste', 7),
(7, 'Avocat en droit des affaires', 8),
(7, 'Avocat en droit de la famille', 9),
(7, 'Avocat fiscaliste', 10),
(7, 'Bâtonnier', '11'),
(7, 'Juriste en entreprise', 12),
(7, 'Notaire', 13),
(7, 'Huissier de justice', 14),
(7, 'Commissaire de justice', 15),
(7, 'Mandataire judiciaire', 16),
(7, 'Médiateur judiciaire', 17),
(7, 'Offier de police judiciaire', 18),
(7, 'Enquêteur criminel', 19),
(7, 'Gendarme de section de recherches', 20),
(7, 'Inspecteur des douanes', 21),
(7, 'Agent de la DGSI', 22),
(7, 'Conversateur des hypothèques' 23),
(7, 'Greffier', 24),
(7, 'Assureur juridique', 25),
(7, 'Expert en propriété intellectuelle', 26),
(7, 'Criminologue', 27),
(8, 'Journaliste reporter', 1),
(8, "Journaliste d'investigation", 2),
(8, 'Présentateur TV / Radio', 3),
(8, 'Rédacteur en chef', 4),
(8, "Correspondant à l'étranger", 5),
(8, 'Chroniqueur', 6),
(8, 'Réalisateur', 7),
(8, 'Scénariste', 8),
(8, 'Monteur vidéo', 9),
(8, 'Cadreur / Directeur de la photographie', 10),
(8, 'Ingénieur du son', 11),
(8, 'Vidéaste web / youtubeur', 12),
(8, 'Community manager', 13),
(8, 'Producteur', 14),
(8, 'Directeur de production', 15),
(8, 'Assistant réalisteur', 16),
(8, 'Critique', 17),
(8, 'Annimateur radio', 18),
(8, 'Réalisateur radio', 19),
(8, 'Technicien radio', 20),
(8, ' Concepteur de podcast', 21),
(8, 'Voix-Off', 22),
(8, 'Editeur', 23),
(8, 'Correcteur / relecteur', 24),
(8, 'Maquettiste de presse', 25),
(8, 'Photographe de presse', 26),
(9, 'Chercheur en physique', 1),
(9, 'Chercheur en biologie', 2),
(9, 'Chercheur en chimie', 3),
(9, 'Chercheur en mathématiques', 4),
(9, 'Chercheur en informatique', 5),
(9, 'Chercheur en neurosciences', 6),
(9, 'Chercheur en psychologie', 7),
(9, 'Chercheur en sociologie', 8),
(9, 'Astrophysicien', 9),
(9, 'Climatologue', 10),
(9, 'Géologue', 11),
(9, 'Virologue', 12),
(9, 'Généticien', 13),
(9, 'Neuroscientifique', 14),
(9, 'Pharmacologue', 15),
(9, 'Ingénieur biomédical', 16),
(9, 'Chercheur en IA médical', 17),
(9, 'Ingénieur en énergie renouvable', 18),
(9, 'Chercheur en cybersécurité', 19),
(9, 'Chef de laboratoire', 19);