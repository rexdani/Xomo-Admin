package com.xomo.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class GoogleAuthController {

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        try {
            // Try multiple field names that frontend might send
            String credential = request.get("credential");
            if (credential == null) {
                credential = request.get("token");
            }
            if (credential == null) {
                credential = request.get("idToken");
            }
            if (credential == null) {
                credential = request.get("id_token");
            }
            
            // Validate credential is not null
            if (credential == null || credential.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Missing credential in request body"));
            }
            
            // Now verify the Google JWT token
            // You'll need to implement GoogleIdTokenVerifier here
            // Example:
            // GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(...)
            //     .setAudience(Collections.singletonList("856313994821-qqi10amq812emvt5q2tgo9otkpf2e21u.apps.googleusercontent.com"))
            //     .build();
            // 
            // GoogleIdToken idToken = verifier.verify(credential);
            // if (idToken == null) {
            //     return ResponseEntity.badRequest().body(Map.of("message", "Invalid Google token"));
            // }
            // 
            // Payload payload = idToken.getPayload();
            // String email = payload.getEmail();
            // String name = (String) payload.get("name");
            
            // TODO: Verify token, get user info, check if admin, generate JWT
            // For now, return a placeholder response
            
            return ResponseEntity.ok(Map.of(
                "message", "Google login successful",
                "token", "your-jwt-token-here",
                "email", "user@example.com",
                "userId", 1,
                "roles", new String[]{"ROLE_ADMIN"}
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Google login failed: " + e.getMessage()));
        }
    }
}

