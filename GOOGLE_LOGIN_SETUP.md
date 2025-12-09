# Google Login Setup

## Frontend Implementation

The Google login has been integrated into the Login page. The frontend is ready to use.

### Client ID
- **Client ID**: `856313994821-qqi10amq812emvt5q2tgo9otkpf2e21u.apps.googleusercontent.com`

## Backend Requirements

Your backend needs to implement a Google OAuth endpoint:

### Endpoint: `POST /auth/google`

**Request Body:**
The frontend sends the credential in multiple field names to ensure compatibility:
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...",
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...",
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...",
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
}
```

**Important:** The backend should check for the credential in any of these fields:
- `credential` (primary)
- `token` (fallback)
- `idToken` (fallback)
- `id_token` (fallback)

The `credential` is the JWT token returned by Google after successful authentication.

**Expected Response:**
```json
{
  "token": "your-jwt-token",
  "roles": [
    { "name": "ROLE_ADMIN" }
  ],
  "email": "user@example.com",
  "userId": 123,
  "message": "Login successful"
}
```

### Backend Implementation Example (Java Spring Boot)

**IMPORTANT:** Always check for null before processing the credential!

```java
@PostMapping("/google")
public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
    try {
        // Try multiple field names that frontend might send
        String credential = request.get("credential");
        if (credential == null || credential.trim().isEmpty()) {
            credential = request.get("token");
        }
        if (credential == null || credential.trim().isEmpty()) {
            credential = request.get("idToken");
        }
        if (credential == null || credential.trim().isEmpty()) {
            credential = request.get("id_token");
        }
        
        // CRITICAL: Validate credential is not null
        if (credential == null || credential.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Missing credential in request body"));
        }
        
        // Now verify the Google JWT token
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
            new NetHttpTransport(),
            JacksonFactory.getDefaultInstance()
        )
        .setAudience(Collections.singletonList("856313994821-qqi10amq812emvt5q2tgo9otkpf2e21u.apps.googleusercontent.com"))
        .build();
        
        GoogleIdToken idToken = verifier.verify(credential);
        if (idToken == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Invalid Google token"));
        }
        
        Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        
        // Your authentication logic here
        // Check if user exists, is admin, etc.
        // Return JWT token with admin role if user is admin
        
        return ResponseEntity.ok(Map.of(
            "token", "your-jwt-token",
            "email", email,
            "roles", new String[]{"ROLE_ADMIN"}
        ));
        
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError()
            .body(Map.of("message", "Google login failed: " + e.getMessage()));
    }
}
```

### Required Dependencies (Java)

```xml
<dependency>
    <groupId>com.google.auth</groupId>
    <artifactId>google-auth-library-oauth2-http</artifactId>
    <version>1.19.0</version>
</dependency>
```

## Testing

1. Click the "Sign in with Google" button
2. Select a Google account
3. The frontend will send the credential to `/auth/google`
4. Backend should verify and return your app's JWT token
5. User will be logged in and redirected to dashboard

## Notes

- Make sure the Google OAuth consent screen is configured in Google Cloud Console
- Add your domain to authorized JavaScript origins
- The backend must verify the Google JWT token before trusting it
- Only users with admin role should be allowed to access the admin panel

