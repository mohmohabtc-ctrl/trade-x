# Guide de Test Complet - Sécurité TradeX en Production

## 📋 Pré-requis Avant les Tests

### ✅ Checklist de Déploiement

- [ ] **Variables Upstash ajoutées à Vercel**
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
  
- [ ] **Migration base de données exécutée**
  - Script `security_password_hashing.sql` exécuté dans Supabase
  - Vérification : 0 mots de passe en clair restants

- [ ] **Déploiement Vercel terminé**
  - Vérifier sur https://vercel.com/your-project/deployments
  - Status: "Ready"

---

## 🧪 Tests de Sécurité en Production

### Test 1: Headers de Sécurité HTTP

**Objectif:** Vérifier que tous les headers de sécurité sont présents

**Commande:**
```bash
curl -I https://votre-app.vercel.app
```

**Résultats attendus:**
```
✅ Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
✅ Content-Security-Policy: default-src 'self'; ...
✅ X-Frame-Options: DENY
✅ X-Content-Type-Options: nosniff
✅ Referrer-Policy: strict-origin-when-cross-origin
✅ Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

**Statut:** ⬜ À tester

---

### Test 2: Rate Limiting sur Login

**Objectif:** Vérifier que le rate limiting bloque après 5 tentatives

**Procédure:**
1. Aller sur `https://votre-app.vercel.app/login`
2. Essayer de se connecter avec un **mauvais mot de passe** 6 fois de suite
3. Utiliser le même email à chaque fois

**Résultats attendus:**
- Tentatives 1-5: Message "Identifiants invalides"
- **Tentative 6:** Message "Trop de tentatives. Réessayez dans X minutes."
- Status HTTP 429 (Too Many Requests)

**Statut:** ⬜ À tester

**Note:** Attendre 15 minutes avant de pouvoir réessayer

---

### Test 3: Cookies Sécurisés

**Objectif:** Vérifier que les cookies ont les flags de sécurité

**Procédure:**
1. Ouvrir DevTools (F12)
2. Aller sur l'onglet **Application** → **Cookies**
3. Se connecter avec des identifiants valides
4. Examiner le cookie `tradeX_demo_user`

**Résultats attendus:**
```
✅ HttpOnly: true (protège contre XSS)
✅ Secure: true (HTTPS uniquement)
✅ SameSite: Strict (protège contre CSRF)
✅ Path: /
✅ Max-Age: 604800 (7 jours)
```

**Statut:** ⬜ À tester

---

### Test 4: Password Hashing (Bcrypt)

**Objectif:** Vérifier que les mots de passe sont hashés en base de données

**Procédure:**
1. Aller sur Supabase Dashboard → SQL Editor
2. Exécuter cette requête:
```sql
SELECT email, LEFT(password, 10) as password_hash 
FROM public.users 
WHERE email = 'votre-email@example.com'
LIMIT 1;
```

**Résultats attendus:**
- Le champ `password_hash` commence par `$2a$` ou `$2b$` (bcrypt)
- Exemple: `$2b$10$N9q...`

**Statut:** ⬜ À tester

---

### Test 5: Fonctionnalité "Mot de Passe Oublié"

**Objectif:** Tester le flow complet de réinitialisation de mot de passe

#### Étape 5.1: Demande de Réinitialisation

**Procédure:**
1. Aller sur `https://votre-app.vercel.app/login`
2. Cliquer sur **"Mot de passe oublié ?"**
3. Entrer votre email dans le modal
4. Cliquer sur **"Envoyer le lien"**

**Résultats attendus:**
- ✅ Message de succès: "Email envoyé !"
- ✅ Pas d'erreur dans la console
- ✅ Modal se ferme proprement

**Statut:** ⬜ À tester

---

#### Étape 5.2: Réception de l'Email

**Procédure:**
1. Vérifier votre boîte mail (inbox + spam)
2. Chercher un email de Supabase

**Résultats attendus:**
- ✅ Email reçu dans les 2 minutes
- ✅ Contient un lien de réinitialisation
- ✅ Lien commence par: `https://votre-app.vercel.app/reset-password?...`

**Statut:** ⬜ À tester

**Note:** Si pas d'email reçu, vérifier:
- Supabase Dashboard → Authentication → Email Templates
- Vérifier que SMTP est configuré

---

#### Étape 5.3: Réinitialisation du Mot de Passe

**Procédure:**
1. Cliquer sur le lien dans l'email
2. Vous êtes redirigé vers `/reset-password`
3. Entrer un nouveau mot de passe (min 8 caractères)
4. Confirmer le mot de passe
5. Cliquer sur **"Réinitialiser le mot de passe"**

**Résultats attendus:**
- ✅ Message de succès: "Mot de passe réinitialisé !"
- ✅ Redirection automatique vers `/login` après 3 secondes
- ✅ Pas d'erreur dans la console

**Statut:** ⬜ À tester

---

#### Étape 5.4: Connexion avec Nouveau Mot de Passe

**Procédure:**
1. Sur la page de login
2. Se connecter avec le **nouveau mot de passe**

**Résultats attendus:**
- ✅ Connexion réussie
- ✅ Redirection vers dashboard ou app selon le rôle
- ✅ Session active

**Statut:** ⬜ À tester

---

### Test 6: Login avec Mot de Passe Hashé

**Objectif:** Vérifier que le login fonctionne avec bcrypt

**Procédure:**
1. Aller sur `https://votre-app.vercel.app/login`
2. Se connecter avec email et mot de passe corrects

**Résultats attendus:**
- ✅ Login réussi
- ✅ Redirection appropriée selon le rôle:
  - MERCHANDISER → `/app`
  - ADMIN/MANAGER/SUPERVISOR → `/dashboard`

**Statut:** ⬜ À tester

---

### Test 7: Protection RBAC (Role-Based Access Control)

**Objectif:** Vérifier que les redirections par rôle fonctionnent

**Procédure:**
1. Se connecter comme **MERCHANDISER**
2. Essayer d'accéder manuellement à `/dashboard`

**Résultats attendus:**
- ✅ Redirection automatique vers `/app`

**Procédure:**
1. Se connecter comme **ADMIN**
2. Essayer d'accéder manuellement à `/app`

**Résultats attendus:**
- ✅ Redirection automatique vers `/dashboard`

**Statut:** ⬜ À tester

---

### Test 8: Validation de Mot de Passe

**Objectif:** Vérifier que les mots de passe faibles sont rejetés

**Procédure:**
1. Aller sur `/reset-password` (via lien email)
2. Essayer d'entrer un mot de passe de **moins de 8 caractères**
3. Exemple: "123"

**Résultats attendus:**
- ✅ Message d'erreur: "Le mot de passe doit contenir au moins 8 caractères"
- ✅ Formulaire non soumis

**Statut:** ⬜ À tester

---

### Test 9: Confirmation de Mot de Passe

**Objectif:** Vérifier que les mots de passe doivent correspondre

**Procédure:**
1. Sur `/reset-password`
2. Entrer "Password123" dans le premier champ
3. Entrer "Password456" dans le champ de confirmation
4. Soumettre

**Résultats attendus:**
- ✅ Message d'erreur: "Les mots de passe ne correspondent pas"
- ✅ Formulaire non soumis

**Statut:** ⬜ À tester

---

### Test 10: Dark Mode

**Objectif:** Vérifier que le dark mode fonctionne partout

**Procédure:**
1. Sur `/login`, cliquer sur l'icône lune/soleil
2. Ouvrir le modal "Mot de passe oublié"
3. Aller sur `/reset-password`

**Résultats attendus:**
- ✅ Tous les éléments s'adaptent au dark mode
- ✅ Texte lisible sur fond sombre
- ✅ Pas de contraste insuffisant

**Statut:** ⬜ À tester

---

## 📊 Résumé des Tests

| Test | Fonctionnalité | Statut | Notes |
|------|----------------|--------|-------|
| 1 | Headers HTTP | ⬜ | - |
| 2 | Rate Limiting | ⬜ | - |
| 3 | Cookies Sécurisés | ⬜ | - |
| 4 | Password Hashing | ⬜ | - |
| 5.1 | Demande Reset | ⬜ | - |
| 5.2 | Email Reçu | ⬜ | - |
| 5.3 | Reset Password | ⬜ | - |
| 5.4 | Login Nouveau MDP | ⬜ | - |
| 6 | Login Bcrypt | ⬜ | - |
| 7 | RBAC | ⬜ | - |
| 8 | Validation MDP | ⬜ | - |
| 9 | Confirmation MDP | ⬜ | - |
| 10 | Dark Mode | ⬜ | - |

---

## 🐛 Dépannage

### Problème: Rate Limiting ne fonctionne pas

**Symptôme:** Peut se connecter plus de 5 fois avec mauvais mot de passe

**Solutions:**
1. Vérifier que les variables Upstash sont dans Vercel
2. Vérifier les logs Vercel pour erreurs Upstash
3. Vérifier le dashboard Upstash pour activité

---

### Problème: Email de reset non reçu

**Symptôme:** Pas d'email après demande de réinitialisation

**Solutions:**
1. Vérifier le dossier spam
2. Aller sur Supabase → Authentication → Email Templates
3. Vérifier que SMTP est configuré (ou utiliser le provider par défaut)
4. Vérifier les logs Supabase

---

### Problème: Erreur lors du reset de mot de passe

**Symptôme:** Message d'erreur sur `/reset-password`

**Solutions:**
1. Vérifier que le lien email n'a pas expiré (valide 1h)
2. Vérifier la console pour erreurs JavaScript
3. Vérifier que Supabase Auth est actif

---

### Problème: Login échoue après migration

**Symptôme:** "Identifiants invalides" avec bon mot de passe

**Solutions:**
1. Vérifier que la migration SQL a été exécutée
2. Vérifier que la fonction `login_demo_user` utilise bcrypt
3. Réinitialiser le mot de passe via "Mot de passe oublié"

---

## ✅ Validation Finale

Une fois tous les tests passés:

- [ ] Tous les tests marqués ✅
- [ ] Aucune erreur dans les logs Vercel
- [ ] Aucune erreur dans les logs Supabase
- [ ] Aucune erreur dans la console navigateur
- [ ] Rate limiting actif (vérifier dashboard Upstash)
- [ ] Headers de sécurité présents
- [ ] Cookies sécurisés
- [ ] Password reset fonctionnel

**🎉 Application sécurisée et prête pour la production !**

---

## 📞 Support

**Dashboards:**
- Vercel: https://vercel.com/
- Supabase: https://app.supabase.com/
- Upstash: https://console.upstash.com/

**Documentation:**
- `SECURITY_SETUP.md` - Configuration détaillée
- `security_audit_report.md` - Rapport d'audit complet
- `deployment_summary.md` - Résumé du déploiement
