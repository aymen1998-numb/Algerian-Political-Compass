# Security Specification

## Data Invariants
1. `User` document can only be created/updated by the owner (`request.auth.uid == userId`).
2. `Message` can be created by anyone (authenticated or anonymous).
3. `Message.content` must be a string and up to 1000 characters.
4. `Message.recipientId` must match an existing user in the database.
5. Users can only read `Message` documents where `recipientId == request.auth.uid`.

## Dirty Dozen Payloads
1. Create user document for another UID (Identity Spoofing).
2. Modify user document of another UID (Unauthorized Update).
3. Update user document with invalid field (Schema Violation).
4. Create message with 2000 character content (Resource Poisoning/Size Limit).
5. Create message with invalid type content (e.g., number for content).
6. Create message for non-existent recipient (Broken Relational Integrity).
7. Create message lacking required `recipientId` or `content` fields (Schema Violation).
8. Add a ghost field `isAdmin` to the message payload (Shadow Update).
9. Read message as non-recipient (Privacy Leak/Unauthorized Read).
10. Delete a message belonging to someone else (Unauthorized Delete).
11. Update a message (State Shortcutting - shouldn't be allowed).
12. Create a message without valid server timestamp for `createdAt`.
