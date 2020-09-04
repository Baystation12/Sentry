--
-- Table structure for table `web_log`
--

CREATE TABLE IF NOT EXISTS `web_log` (
  `id` int(11) NOT NULL,
  `user_id` char(36) NOT NULL, -- UUID
  `message` varchar(255) NOT NULL,
  `when` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Triggers `web_log`
--
DELIMITER $$
CREATE TRIGGER `datetimefix` BEFORE INSERT ON `web_log`
 FOR EACH ROW SET NEW.when = NOW()
$$
DELIMITER ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `web_log`
--
ALTER TABLE `web_log`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `web_log`
--
ALTER TABLE `web_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
