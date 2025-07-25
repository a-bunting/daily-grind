<?php
// includes/jwt.php
class JWT {
    private static $secret_key = "this-is-an-exc3pt10n4l1Y-s3cRET-k3y-F0R-th3-D41lY-gr1ND-4Pp-96db98b68B969n986T"; // Change this!
    private static $algorithm = 'HS256';

    public static function generate($user_id, $username) {
        $issued_at = time();
        $expire_time = $issued_at + (24 * 60 * 60); // 24 hours

        $payload = [
            'iat' => $issued_at,
            'exp' => $expire_time,
            'user_id' => $user_id,
            'username' => $username
        ];

        return self::encode($payload);
    }

    public static function validate($jwt) {
        try {
            $decoded = self::decode($jwt);
            
            if ($decoded['exp'] < time()) {
                return false;
            }
            
            return $decoded;
        } catch (Exception $e) {
            return false;
        }
    }

    private static function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => self::$algorithm]);
        $payload = json_encode($payload);
        
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::$secret_key, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    private static function decode($jwt) {
        $tokenParts = explode('.', $jwt);
        
        if (count($tokenParts) !== 3) {
            throw new Exception('Invalid token structure');
        }
        
        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
        $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[2]));
        
        $expectedSignature = hash_hmac('sha256', $tokenParts[0] . "." . $tokenParts[1], self::$secret_key, true);
        
        if (!hash_equals($signature, $expectedSignature)) {
            throw new Exception('Invalid signature');
        }
        
        return json_decode($payload, true);
    }
}