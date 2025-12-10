# TradeX Security Configuration Guide

## Required Environment Variables

Pour que les nouvelles fonctionnalités de sécurité fonctionnent, vous devez ajouter les variables d'environnement suivantes à votre fichier `.env.local` :

### Upstash Redis (Rate Limiting)

1. **Créer un compte Upstash** : https://upstash.com/
2. **Créer une base Redis** :
   - Aller sur Console → Redis
   - Cliquer "Create Database"
   - Choisir une région proche de vos utilisateurs
   - Type: "Regional" (gratuit)
   - Cliquer "Create"

3. **Récupérer les credentials** :
   - Dans votre dashboard Redis
   - Onglet "REST API"
   - Copier `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`

4. **Ajouter à `.env.local`** :
```bash
# Upstash Redis for Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### Variables Existantes (à vérifier)

Assurez-vous que ces variables sont déjà présentes :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Node Environment
NODE_ENV=development  # ou 'production' en production
```

---

## Configuration Vercel (Production)

Pour déployer en production avec les nouvelles fonctionnalités de sécurité :

1. **Aller sur Vercel Dashboard** → Votre projet → Settings → Environment Variables

2. **Ajouter les variables Upstash** :
   - `UPSTASH_REDIS_REST_URL` = `https://your-redis-url.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN` = `your-token-here`
   - Environnement: **Production, Preview, Development**

3. **Vérifier NODE_ENV** :
   - `NODE_ENV` = `production`
   - Environnement: **Production uniquement**

4. **Redéployer** :
   ```bash
   git push origin main
   ```

---

## Migration de la Base de Données Supabase

### Étape 1: Exécuter le Script de Migration

1. **Ouvrir Supabase Dashboard** : https://app.supabase.com/
2. **Aller dans SQL Editor**
3. **Créer une nouvelle query**
4. **Copier-coller le contenu de `security_password_hashing.sql`**
5. **Exécuter le script** (bouton "Run")

### Étape 2: Vérifier la Migration

Exécutez cette requête pour vérifier que tous les mots de passe sont hashés :

```sql
SELECT COUNT(*) as plaintext_passwords_remaining
FROM public.users 
WHERE password IS NOT NULL 
AND password != ''
AND NOT (password LIKE '$2a$%' OR password LIKE '$2b$%');
```

**Résultat attendu** : `plaintext_passwords_remaining = 0`

### Étape 3: Tester le Login

1. Essayer de se connecter avec un compte existant
2. Si le login échoue, c'est normal (le mot de passe a été hashé)
3. Options :
   - **Option A** : Réinitialiser le mot de passe via Supabase Dashboard
   - **Option B** : Créer un nouveau compte de test

---

## Tests de Vérification

### 1. Test Rate Limiting (Local)

```bash
# Terminal 1: Démarrer le serveur
npm run dev

# Terminal 2: Tester le rate limiting
for i in {1..7}; do 
  curl -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
done
```

**Résultat attendu** :
- Requêtes 1-5 : Status 401 (Unauthorized)
- Requêtes 6-7 : Status 429 (Too Many Requests)

### 2. Test Cookies Sécurisés

1. Ouvrir DevTools → Application → Cookies
2. Se connecter
3. Vérifier le cookie `tradeX_demo_user` :
   - ✅ `HttpOnly` = true
   - ✅ `Secure` = true (en production)
   - ✅ `SameSite` = Strict

### 3. Test Headers de Sécurité (Production)

```bash
curl -I https://votre-app.vercel.app
```

Vérifier la présence de :
- `Strict-Transport-Security`
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`

### 4. Test Password Hashing

```sql
-- Dans Supabase SQL Editor
-- Créer un utilisateur test
INSERT INTO public.users (id, email, password, role, name)
VALUES (gen_random_uuid()::text, 'test-hash@example.com', 'TestPassword123!', 'ADMIN', 'Test User');

-- Vérifier que le mot de passe est hashé
SELECT id, email, LEFT(password, 10) as password_hash 
FROM public.users 
WHERE email = 'test-hash@example.com';
-- Le password_hash devrait commencer par $2a$ ou $2b$

-- Tester le login RPC
SELECT login_demo_user('test-hash@example.com', 'TestPassword123!');
-- Devrait retourner les données utilisateur

SELECT login_demo_user('test-hash@example.com', 'WrongPassword');
-- Devrait retourner null
```

---

## Dépannage

### Erreur: "Cannot connect to Upstash Redis"

**Cause** : Variables d'environnement manquantes ou incorrectes

**Solution** :
1. Vérifier `.env.local` contient `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`
2. Redémarrer le serveur de dev : `npm run dev`
3. Vérifier les credentials sur Upstash Dashboard

### Erreur: "Login failed" après migration

**Cause** : Mot de passe hashé, ancien mot de passe en clair ne fonctionne plus

**Solution** :
1. Aller sur Supabase Dashboard → Authentication → Users
2. Trouver l'utilisateur
3. Cliquer "..." → "Reset Password"
4. Ou créer un nouvel utilisateur de test

### Erreur: "Content Security Policy violation"

**Cause** : CSP bloque certaines ressources

**Solution** :
1. Ouvrir DevTools → Console
2. Identifier la ressource bloquée
3. Ajouter le domaine à `next.config.ts` dans la directive CSP appropriée

---

## Rollback (En cas de problème)

Si vous rencontrez des problèmes critiques :

### 1. Désactiver Rate Limiting

Commenter temporairement dans `app/api/login/route.ts` :

```typescript
// const { success, limit, remaining, reset } = await loginRateLimiter.limit(identifier)
// if (!success) { ... }
```

### 2. Rollback Password Hashing

Exécuter dans Supabase SQL Editor :

```sql
-- Restaurer l'ancienne version de login_demo_user
-- (copier depuis complete_saas_setup.sql lignes 303-332)
```

### 3. Désactiver Security Headers

Dans `next.config.ts`, commenter la section `headers()` :

```typescript
const nextConfig: NextConfig = {
  // async headers() { ... }
};
```

---

## Checklist de Déploiement

- [ ] Variables Upstash ajoutées à `.env.local`
- [ ] Variables Upstash ajoutées à Vercel
- [ ] Script `security_password_hashing.sql` exécuté sur Supabase
- [ ] Vérification : 0 mots de passe en clair restants
- [ ] Test rate limiting en local (5 tentatives max)
- [ ] Test login avec mot de passe hashé
- [ ] Vérification cookies sécurisés (DevTools)
- [ ] Déploiement sur Vercel
- [ ] Test headers de sécurité en production
- [ ] Monitoring des logs pour erreurs

---

## Support

En cas de problème, vérifier :
1. Logs Vercel : https://vercel.com/your-project/logs
2. Logs Supabase : Dashboard → Logs
3. Logs Upstash : Dashboard → Logs
