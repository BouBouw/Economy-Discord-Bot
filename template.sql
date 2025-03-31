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
(1, '853261887520505866', NULL, 0, 0, '2025-03-14', '2025-03-14 19:56:55');

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