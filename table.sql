CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `email` varchar(40),
  `nickname` varchar(50) DEFAULT NULL,
  `thumbnail` varchar(200),
  `provider` varchar(10),
  PRIMARY KEY (`id`)
);

CREATE TABLE `catchFishData`(
   `user` char(20),
    `fishType` char(20),
    `fishLength` char(10),
    `latitude` char(20),
    `longitude` char(20),
    `imagePath` char(50),
    `grade` char(5)
);

alter table `catchFishData` add `grade` char(5);

