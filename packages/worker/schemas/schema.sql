DROP TABLE IF EXISTS submissions;
CREATE TABLE submissions (
  id TEXT NOT NULL, 
  data TEXT NOT NULL, 
  timestamp INT NOT NULL,
  account_id TEXT NOT NULL,
  form_id TEXT NOT NULL,
  PRIMARY KEY (`id`)
);