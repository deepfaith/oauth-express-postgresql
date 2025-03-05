# OAuth Service with Express and PostgreSQL

This project sets up an OAuth2 service using Express.js and PostgreSQL for managing authentication and subscribers. It includes an API for handling OAuth2 token generation, subscriber management, and JWT authentication.

## Prerequisites

Ensure that you have the following installed:
- Node.js (v22 or later)
- Docker (for containerization)
- PostgreSQL (via Docker or local installation)
- Docker Compose

## Project Setup

### Install Dependencies
Install the required Node.js dependencies (Optional if you want to develop):

```bash
npm install
```

## Docker Setup

This project includes a `docker-compose.yml` file to easily set up the necessary services (PostgreSQL and the API). Here's how to run it:

1. Build the Docker images and start the services:

```bash
docker-compose up --build
```

2. This will set up the PostgreSQL database and the API service. The application will be available at `http://localhost:5000`.

### Docker Compose Configuration

- **postgres**: Runs a PostgreSQL 15 container with the `ims_db` database.
- **api**: Runs the OAuth API and connects to the PostgreSQL container. Exposes ports `5000` (API) and `9229` (for debugging).

### Exposed Ports
- `5000`: API server
- `9229`: Debugging port (for VS Code or Chrome)

### Volumes
- `postgres_data`: Persists PostgreSQL data.
- `api_node_modules`: Ensures Node modules are installed inside the container.

## API Endpoints

### OAuth2 Endpoints

- **POST /api/oauth/token**: OAuth2 Token Generation (supports `authorization_code` and `client_credentials` grant types).

### Subscriber Endpoints

- **GET /api/ims/subscriber/:phoneNumber**: Retrieves subscriber details by phone number.
- **PUT /api/ims/subscriber/:phoneNumber**: Adds or updates subscriber information.
- **DELETE /api/ims/subscriber/:phoneNumber**: Deletes a subscriber.

Here is a modified version of your README file that incorporates the OAuth2 endpoints, table structure, and example cURL commands.

---

# OAuth2 API Documentation

This repository provides an API for OAuth2 authentication, including token generation and client management using PostgreSQL. It supports multiple OAuth2 grant types, including `authorization_code` and `client_credentials`.


## Database Migrations

This project utilizes database migrations to manage the database schema and initial data.

**Migration File:**

The primary migration file is located at `src/db/migrations/migrate.ts`. This file contains:

*   **Database Schema:** The definition of the database tables, columns, and relationships.
*   **Initial Data:**  Seed data that is inserted into the database upon initial setup.

**Purpose:**

This migration is specifically designed to set up the necessary schema and data for the OAuth endpoints used within the application.

## Database Tables

### `oauth_clients`

This table stores the details of OAuth2 clients, including their `client_id`, `client_secret`, and a name identifier.

| client_id | client_secret | name           |
|-----------|---------------|----------------|
| client1   | secret1       | Test Client 1  |
| client2   | secret2       | Test Client 2  |

### `oauth_codes`

This table stores the temporary authorization codes for OAuth2 authorization code flow. The code is issued to the client after the user grants authorization.

| code      | client_id | expires_at         |
|-----------|-----------|--------------------|
| code123   | client1   | 2025-03-06 12:00:00|

### `oauth_tokens`

This table stores the OAuth2 access and refresh tokens that are issued to clients. Each token has an associated expiration time and client ID.

| token_id | client_id | user_id | access_token       | refresh_token     | expires_at         |
|----------|-----------|---------|--------------------|-------------------|--------------------|
| 1        | client1   | user1   | access_token_123   | refresh_token_123 | 2025-03-06 12:00:00|

### `subscribers`

This table stores subscriber information, including phone number, username, password, and the subscriber's status.

| phone_number | username   | password   | domain        | status   | features |
|--------------|------------|------------|---------------|----------|----------|
| 1234567890   | subscriber1| password1  | example.com   | ACTIVE   | {}       |

## OAuth2 Endpoints

### POST `/api/oauth/token`

This endpoint generates OAuth2 tokens (`access_token` and `refresh_token`) for clients. It supports the **authorization_code** and **client_credentials** grant types.

#### Request Body:

- For **authorization_code** grant type:
  ```json
  {
    "grant_type": "authorization_code",
    "code": "authorization_code_from_oauth_codes_table",
    "redirect_uri": "https://your-app.com/callback",
    "client_id": "your_client_id",
    "client_secret": "your_client_secret"
  }
  ```

- For **client_credentials** grant type:
  ```json
  {
    "grant_type": "client_credentials",
    "client_id": "your_client_id",
    "client_secret": "your_client_secret"
  }
  ```

#### Response:

- **200 OK** - On successful token generation:
  ```json
  {
    "access_token": "generated_access_token",
    "token_type": "bearer",
    "expires_in": 3600,  // Token expiration in seconds
    "refresh_token": "generated_refresh_token"  // Only for authorization_code grant type
  }
  ```

- **400 Bad Request** - On invalid request parameters:
  ```json
  {
    "error": "invalid_request",
    "error_description": "Invalid client_id, client_secret, or grant type"
  }
  ```

#### Example cURL Requests:

- **Authorization Code Grant Type**:

```bash
curl -X POST https://your-api.com/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "authorization_code_from_oauth_codes_table",
    "redirect_uri": "https://your-app.com/callback",
    "client_id": "client1",
    "client_secret": "secret1"
  }'
```

- **Client Credentials Grant Type**:

```bash
curl -X POST https://your-api.com/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "client_credentials",
    "client_id": "client1",
    "client_secret": "secret1"
  }'
```

---

### OAuth2 Token Flow Example

1. **Authorization Code Grant Type**:
    - A client requests an authorization code by redirecting the user to an authorization URL.
    - The user authorizes the client, and the authorization server responds with a temporary code.
    - The client exchanges this code for an `access_token` and `refresh_token` by calling the `/api/oauth/token` endpoint.

2. **Client Credentials Grant Type**:
    - This flow is used by clients (without user interaction) to request an `access_token` directly using their client credentials.

---

## Example Tables and Data

1. **`oauth_clients`** table:

   | client_id | client_secret | name           |
      |-----------|---------------|----------------|
   | client1   | secret1       | Test Client 1  |
   | client2   | secret2       | Test Client 2  |

2. **`oauth_codes`** table (example for the authorization code flow):

   | code      | client_id | expires_at         |
      |-----------|-----------|--------------------|
   | code123   | client1   | 2025-03-06 12:00:00|

3. **`oauth_tokens`** table (example for generated tokens):

   | token_id | client_id | user_id | access_token       | refresh_token     | expires_at         |
      |----------|-----------|---------|--------------------|-------------------|--------------------|
   | 1        | client1   | user1   | access_token_123   | refresh_token_123 | 2025-03-06 12:00:00|

---

## Environment Variables

The following environment variables are required for the application to run correctly:

- `PORT`: The port on which the API will run (default: 5000).
- `DATABASE_URL`: PostgreSQL connection URL (e.g., `postgresql://postgres:password@postgres:5432/ims_db`).
- `JWT_SECRET`: Secret key for signing JWT tokens.
- `NODE_ENV`: Environment mode (set to `development`).
- `TOKEN_EXPIRATION`: Expiration time for the access token (default: 3600 seconds).
- `REFRESH_TOKEN_EXPIRATION`: Expiration time for the refresh token (default: 86400 seconds).

## Authentication

The application uses JWT (JSON Web Token) for authentication. Tokens are issued through the OAuth2 endpoints, and all routes except the token generation require the `Authorization` header with a valid token.

To authenticate requests:

- Include the JWT in the `Authorization` header as a Bearer token:
  ```bash
  Authorization: Bearer <your-token-here>
  ```

## Error Handling

The application includes global error handling with specific responses for various errors such as `UnauthorizedError`, `ValidationError`, and `BadRequest`. Common error responses include status codes like `401`, `400`, and `500`.

### Example Error Responses:

- **401 Unauthorized**: Missing or invalid token.
- **400 Bad Request**: Invalid input data.
- **500 Internal Server Error**: Server-side issues.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

---

This README provides a basic overview of setting up, running, and interacting with the OAuth service. If you need more details on specific configurations or components, feel free to explore the code or raise an issue!
