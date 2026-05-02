# Test Credentials — ACADEMIX AI

## Primary Test Account (seeded via API during smoke test)
- Email: `test@academix.ai`
- Password: `testpass123`
- Name: Test Student

## Registration endpoint
- `POST /api/auth/register` — body: `{"email","password","name"}`
- `POST /api/auth/login` — body: `{"email","password"}`
- Returns: `{"access_token","token_type","user":{"id","email","name"}}`

Testing agent may create additional users via `/api/auth/register`.
