# Project Guidance

## User Preferences

- Store branding: Mr Kipmasai Mini Mart
- Prices shown in Malaysian Ringgit (RM)

## Accepted Requirements

[Filled after each deployed build — what the user asked for and the build delivered]

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend: mops.toml pins caffeineai-oql 0.7.1; OQL auto-derive (toEntity) fails on records with optional or nested fields, so use toEntityManual with explicit .payload per field and import the field type's _toRow module (IntValue, NatValue, TextValue, PrincipalValue, BlobValue) in main.mo.
- Backend: a mo:caffeineai-* import fails M0010 unless the matching caffeineai-* package is in mops.toml [dependencies]; add it with mops add <pkg>.
- Backend: under Enhanced Migration the pending migration in src/backend/migrations/00000000_000000.mo must list every stable actor field in NewActor, with inline record shapes since migrations cannot import project types.
- Frontend: Product.image is an optional ExternalBlob; render with product.image?.getDirectURL(). Upload via ExternalBlob.fromBytes(bytes, type, name).withUploadProgress(cb).
- Frontend: backend sen and timestamps are bigint; CartLine stores productId/priceSen as strings, so convert with BigInt(line.priceSen) before formatSen or arithmetic.
- Frontend: no Toaster is mounted in this app; use inline role=status/alert feedback blocks instead of sonner toasts.
- Frontend: biome useSemanticElements wants <output> for role=status and <fieldset> for role=group; swap the element and drop the role attribute.
- Frontend: the products route has no validateSearch, so useSearch({strict:false}) plus functional navigate search updaters read and write the category and q URL params.
