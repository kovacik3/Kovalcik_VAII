-- =====================================================
-- Gym Rezervácie – databázová schéma (MySQL)
--
-- Tento skript vytvára tabuľky pre aplikáciu (users/trainers/sessions/reservations)
-- a nastavuje väzby medzi nimi.
--
-- Dôležité k názvu databázy:
--   Skript je pripravený pre databázu `gym_rezervacie` (nižšie je CREATE SCHEMA + USE).
--   Ak chceš iný názov databázy, uprav ho na 2 miestach:
--     1) CREATE SCHEMA IF NOT EXISTS `...`
--     2) USE `...`
--   a rovnako nastav rovnaký názov do `.env` (premenná DB_NAME).
--
-- Tip: Ak importuješ cez Workbench, stačí spustiť celý skript.
--      Ak importuješ cez CLI, daj pozor, aby názov DB sedel s DB_NAME.
-- =====================================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema / database
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `gym_rezervacie` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_slovak_ci ;
USE `gym_rezervacie` ;
-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `users` ;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'trainer', 'user') NOT NULL DEFAULT 'user',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `username` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_slovak_ci;

CREATE UNIQUE INDEX `email` ON `users` (`email` ASC);

-- users:
--  - registrácia/prihlásenie (login podľa emailu)
--  - role: admin / trainer / user
--  - username sa používa na zobrazenie v UI (navbar, rezervácie)


-- -----------------------------------------------------
-- Table `trainers`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `trainers` ;

CREATE TABLE IF NOT EXISTS `trainers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `specialization` VARCHAR(150) NOT NULL,
  `photo_path` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_slovak_ci;

-- trainers:
--  - zoznam trénerov a ich špecializácie
--  - photo_path je cesta k obrázku (napr. /images/... alebo /uploads/trainers/...)


-- -----------------------------------------------------
-- Table `sessions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `sessions` ;

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `start_at` DATETIME NOT NULL,
  `end_at` DATETIME NOT NULL,
  `capacity` INT NOT NULL,
  `trainer_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sessions_trainer`
    FOREIGN KEY (`trainer_id`)
    REFERENCES `trainers` (`id`)
    ON DELETE SET NULL
    ON UPDATE RESTRICT)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_slovak_ci;

CREATE INDEX `idx_sessions_trainer_id` ON `sessions` (`trainer_id` ASC);

CREATE INDEX `idx_sessions_start_at` ON `sessions` (`start_at` ASC);

-- sessions:
--  - skupinové tréningy (title, start/end, kapacita)
--  - voliteľne priradený tréner (trainer_id)
--  - ON DELETE SET NULL: pri zmazaní trénera zostane tréning zachovaný, len sa odpojí tréner


-- -----------------------------------------------------
-- Table `reservations`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `reservations` ;

CREATE TABLE IF NOT EXISTS `reservations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `session_id` INT NOT NULL,
  `client_name` VARCHAR(100) NOT NULL,
  `note` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_res_session`
    FOREIGN KEY (`session_id`)
    REFERENCES `sessions` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_reservations_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_slovak_ci;

CREATE INDEX `idx_reservations_session_id` ON `reservations` (`session_id` ASC);

CREATE INDEX `idx_reservations_user_id` ON `reservations` (`user_id` ASC);

CREATE INDEX `idx_reservations_created_at` ON `reservations` (`created_at` ASC);

-- Zabráni duplicitným rezerváciám (1 user -> max 1 rezervácia na 1 session)
CREATE UNIQUE INDEX `ux_reservations_user_session` ON `reservations` (`user_id` ASC, `session_id` ASC);

-- reservations:
--  - rezervácia používateľa na konkrétny tréning (session)
--  - ON DELETE CASCADE na session/user: ak zmažeš tréning alebo používateľa, rezervácie sa automaticky zmažú
--  - unikát (user_id, session_id): používateľ si nevie spraviť duplicitnú rezerváciu na ten istý tréning


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
