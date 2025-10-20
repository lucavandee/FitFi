# Admin Role System

## Overzicht

FitFi gebruikt een database-backed admin role system. Admin rechten worden **automatisch** toegekend aan gebruikers met een `@fitfi.ai` email adres.

## Architectuur

### Database Schema

**Tabel**: `profiles`
- **Kolom**: `is_admin` (boolean, default: false, NOT NULL)
- **Index**: `idx_profiles_is_admin` (voor query performance)

### Automatische Toekenning

**Trigger**: `on_profile_created_set_admin`
- **Wanneer**: BEFORE INSERT op `profiles` tabel
- **Functie**: `set_admin_for_fitfi_emails()`
- **Logic**:
  ```sql
  IF user_email LIKE '%@fitfi.ai' THEN
    is_admin := true
  ELSE
    is_admin := false
  END IF
  ```

### Frontend Integratie

**Hook**: `useIsAdmin()`
- **Locatie**: `/src/hooks/useIsAdmin.ts`
- **Check**: `user?.isAdmin` (van database)
- **Return**: `{ isAdmin: boolean, user: FitFiUser | null }`

**User Context**: `UserContext`
- **Locatie**: `/src/context/UserContext.tsx`
- **Field**: `isAdmin?: boolean` in `FitFiUser` interface
- **Fetch**: Wordt geladen bij login/session check via `profiles.is_admin`

## Gebruik

### In een Component

```typescript
import { useIsAdmin } from '@/hooks/useIsAdmin';

export default function MyAdminComponent() {
  const { isAdmin, user } = useIsAdmin();

  if (!isAdmin) {
    return <div>Geen toegang</div>;
  }

  return <div>Admin content</div>;
}
```

### In een Route

```typescript
<Route
  path="/admin/brams-fruit"
  element={
    <RequireAuth>
      <WithSeo.AdminBramsFruit />
    </RequireAuth>
  }
/>
```

De component zelf checkt `isAdmin` en toont een foutmelding als de user geen admin is.

## Security

### RLS Policy

**Policy**: "Users can view own admin status"
- **Actie**: SELECT
- **Target**: authenticated users
- **Condition**: `auth.uid() = id`
- **Effect**: Users kunnen hun eigen `is_admin` status lezen, maar niet die van anderen

### Waarom Veilig?

1. ✅ **Database-backed**: Admin status staat in database, niet in code
2. ✅ **Automatisch**: Trigger zorgt voor consistentie bij registratie
3. ✅ **Onveranderbaar**: Users kunnen hun eigen `is_admin` niet wijzigen (geen UPDATE policy)
4. ✅ **Domein-gebaseerd**: Alleen @fitfi.ai emails krijgen admin rechten
5. ✅ **RLS protected**: Row Level Security voorkomt ongeautoriseerde toegang

## Admin Routes

Huidige admin-only routes:
- `/admin/analytics` - Embedding analytics dashboard
- `/admin/products` - Stripe products management
- `/admin/stripe-setup` - Stripe configuratie
- `/admin/brams-fruit` - Brams Fruit product management

## Testing

### Verificatie in Database

```sql
-- Check welke users admin zijn
SELECT
  u.email,
  p.full_name,
  p.is_admin,
  p.tier
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE p.is_admin = true;
```

### Test Scenario's

1. **@fitfi.ai registratie**
   - Maak account met `test@fitfi.ai`
   - Verwachting: `is_admin = true`

2. **Niet-@fitfi.ai registratie**
   - Maak account met `test@gmail.com`
   - Verwachting: `is_admin = false`

3. **Admin route toegang**
   - Log in als @fitfi.ai user → toegang tot `/admin/*`
   - Log in als niet-admin → "Geen toegang" bericht

## Toekomstige Uitbreidingen

Mogelijke verbeteringen:
- [ ] Admin dashboard met user management
- [ ] Mogelijkheid om manual admin rechten toe te kennen
- [ ] Audit log voor admin acties
- [ ] Meerdere admin levels (super admin, moderator, etc.)
- [ ] Admin-only API endpoints met JWT verification

## Migratie Details

**Bestand**: `supabase/migrations/*_add_admin_role_system.sql`
**Datum**: 2025-10-20
**Onderdelen**:
- Schema wijzigingen (kolom + index)
- Trigger functie + trigger definitie
- RLS policy
- Data migratie (bestaande @fitfi.ai users)
