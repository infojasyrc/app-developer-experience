## Using Firebase

### Authentication Script

'`firebase-auth-test.js`': This script allows you to retrieve an access token for Firebase Authentication, either as an admin or a test user defined in the `.env` file according to your environment.

#### Prerequisites

Before using this script, ensure you have the following:

- Firebase project credentials configured in your Firebase account
- An `.env` file containing your Firebase configuration. This file should include the following variables:
  - `AUTH_API_KEY`
  - `AUTH_DOMAIN`
  - `AUTH_PROJECT_ID`
  - `AUTH_STORAGE_BUCKET`
  - `AUTH_MESSAGING_SENDER_ID`
  - `AUTH_APP_ID`
  - `AUTH_MEASUREMENT_ID`
- Ensure that you create a `sample-roles.json` file within the credentials directory, adhering to the following structure:

    ```bash
    {
      "admin": {
        "id": "adminId",
        "email": "admin@example.com",
        "password": "adminPassword"
      },
      "user": {
        "id": "userId",
        "email": "user@example.com",
        "password": "userPassword"
      }
    }
    ```

#### Usage

You can run the script with the following command:

  ```bash
  make  get-token [ROLE=admin | ROLE=user]
  ```

*If no role is provided, it defaults to `ROLE=admin`*

The console will display the token, which should be sent in the authorization header as a bearer token to perform operations in the app.

### Firebase API Endpoint (Alternative)

If you prefer to interact with Firebase Authentication through a direct API endpoint, you can make POST requests to this endpoint with the required payload to retrieve an access token:

- **Method:** POST
- **Content-Type:** application/json
- **Endpoint:** https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=[AUTH_API_KEY]
- **Request Body Payload:**
```json
{
  "email":"[user@example.com]",
  "password":"[PASSWORD]",
  "returnSecureToken":true
}
```

### Firebase AuthStrategy

The FirebaseAuthStrategy is part of our security infrastructure, leveraging JWT for authentication. The secretOrKey parameter is pivotal, ensuring the JWT's integrity by matching it against a known secret.

- Purpose: Validates JWT tokens' signatures to confirm their authenticity and integrity.
- Configuration: Sourced from the PRIVATE_KEY environment variable. It's critical for the PRIVATE_KEY to remain confidential to maintain security.
- Implementation: The strategy utilizes this key to decode and validate incoming JWTs in the Authorization header of requests.

### Setup Firebase PrivateKey

- Go to the Firebase Console

- Open Project Settings: Click on the gear icon (⚙️) next to 'Project Overview

- Navigate to Cloud Messaging: IFind Your Web Push Certificates: Scroll down to the 'Web configuration' section. Here, you'll see an area labeled 'Web Push certificates'.

- Locate the Public VAPID Key: Under 'Web Push certificates', you should see your VAPID key listed. There will be a 'Key pair' or similar label, followed by a long string of characters. This is your PrivateKey.

- Copy the Public PrivateKey

You can find further information in the external link:
[Firebase Auth REST API - Sign in with email / password](https://your-firebase-project-id.firebaseapp.com/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword)
