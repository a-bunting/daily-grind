<?php
    class Database {
        private $host;
        private $db_name;
        private $username;
        private $password;
        public $conn;

        public function __construct() {
            // Set database credentials in constructor instead of class properties
            $this->host = "107.6.172.118"; // Change to your host
            $this->db_name = "sweetoco_daily-grind";
            $this->username = "sweetoco_daily-grind-76VB9876BHNygt"; // Change to your username  
            $this->password = "2UlAwlZJ3M_@CSoIY*"; // Change to your password
        }

        public function getConnection() {
            $this->conn = null;
            try {
                $this->conn = new PDO(
                    "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                    $this->username,
                    $this->password,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false
                    ]
                );

            } catch(PDOException $exception) {
                error_log("Connection error: " . $exception->getMessage());
                throw new Exception("Database connection failed");
            }
            return $this->conn;
        }
    }
?>