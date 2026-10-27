-- AccountPulse safe initial schema. Run only on an empty MySQL database.
CREATE TABLE IF NOT EXISTS customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  display_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(16) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS accounts (
  account_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  account_number VARCHAR(20) NOT NULL UNIQUE,
  account_type ENUM('current','savings') NOT NULL DEFAULT 'current',
  opening_balance DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  balance DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT fk_accounts_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  CONSTRAINT ck_accounts_balance CHECK (balance >= 0)
);
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  transaction_type ENUM('deposit','withdrawal','transfer_in','transfer_out') NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  category VARCHAR(64) NOT NULL DEFAULT 'General',
  description VARCHAR(255) NOT NULL DEFAULT '',
  reference_id VARCHAR(32) NOT NULL,
  CONSTRAINT fk_transactions_account FOREIGN KEY (account_id) REFERENCES accounts(account_id),
  CONSTRAINT ck_transactions_amount CHECK (amount > 0),
  INDEX ix_transactions_account_date (account_id, transaction_date)
);
