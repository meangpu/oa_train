CREATE TABLE IF NOT EXISTS `oa_test` (
  `test_id` int NOT NULL AUTO_INCREMENT,
  `user_steamHex` varchar(50) DEFAULT NULL,
  `data` varchar(50) DEFAULT NULL,
  `message` varchar(50) DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`test_id`),
  INDEX `idx_user_steamHex` (`user_steamHex`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- DROP TABLE IF EXISTS oa_test;