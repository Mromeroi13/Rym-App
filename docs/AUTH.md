# RyM App — Authentication & Authorization v1.0

## 1. Authentication

Use Supabase Auth.

Required flows:
- registration
- login
- logout
- password recovery/reset
- authenticated session persistence

## 2. Roles

Exactly two roles:

- user
- admin

No trainer role.

## 3. Authorization model

### User
A normal user can:
- read/update their profile;
- create/read/update/delete their own routines;
- create/read/update/delete their own calendar assignments;
- start and manage their own workouts;
- create/read/update/delete their own meals;
- browse official exercises;
- submit exercise proposals.

### Admin
An admin can do everything a user can, plus:
- manage users;
- manage official exercises;
- review exercise proposals.

## 4. Security principles

- Never rely solely on frontend role checks.
- RLS must enforce ownership.
- Admin operations must have server/database enforcement.
- Users must not read or modify another user's private records.
- A client must not be able to self-elevate from user to admin.

## 5. Role assignment

Role changes should be performed only through an explicitly authorized administrative path.

The frontend may use role information to show/hide navigation, but the database remains authoritative.

## 6. Session behavior

Authenticated routes require a valid session.

Unauthenticated users should be redirected to the authentication flow.

Logout must invalidate the local authenticated state and return the user to the unauthenticated experience.
