CREATE TABLE `users` (
  `id` varchar(30) NOT NULL,
  `email` varchar(20),
  `nickname` varchar(200) DEFAULT NULL,
  `password` varchar(200),
  PRIMARY KEY (`id`)
);