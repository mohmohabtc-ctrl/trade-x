# Guide de Migration Merch-Field vers Supabase (Production)

Ce guide vous explique comment passer des données fictives ("Mock Data") à une vraie base de données Cloud.

## Étape 1 : Créer le projet Supabase
1. Allez sur [database.new](https://database.new) et créez un nouveau projet.
2. Donnez-lui un nom (ex: `merch-field-app`).
3. Notez le mot de passe de la base de données.
4. Une fois prêt, allez dans **Project Settings > API** et copiez :
   - L'URL du projet (`https://xyz.supabase.co`)
   - La clé publique `anon` key.

## Étape 2 : Créer la structure (Tables)
1. Dans le menu de gauche de Supabase, cliquez sur **SQL Editor**.
2. Cliquez sur **+ New Query**.
3. Copiez-collez TOUT le contenu du fichier `supabase_schema.sql` (fourni dans l'application).
4. Cliquez sur **Run** (en bas à droite).
   > ✅ Succès : Vous devriez voir "Success, no rows returned". Vos tables sont créées !

## Étape 3 : Configurer le Stockage (Photos)
1. Dans le menu de gauche, cliquez sur **Storage**.
2. Cliquez sur **New Bucket**.
3. Nommez-le `mission-photos`.
4. Assurez-vous que le bucket est **Public**.
5. Sauvegardez.

## Étape 4 : Connecter l'Application
1. Installez le client Supabase dans votre projet :
   ```bash
   npm install @supabase/supabase-js
   ```
2. Créez un fichier `.env` à la racine du projet :
   ```env
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-cle-anon-publique
   ```
3. Créez un fichier `src/supabaseClient.ts` :
   ```typescript
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

## Étape 5 : Remplacer les Mock Data
C'est la partie développement. Vous devrez remplacer les appels aux variables `MOCK_...` par des appels Supabase.

**Exemple pour charger les visites :**
```typescript
// Avant (Mock)
// const [visits, setVisits] = useState(MOCK_VISITS);

// Après (Supabase)
useEffect(() => {
  const fetchVisits = async () => {
    let { data: visits, error } = await supabase
      .from('visits')
      .select(`
        *,
        store:stores(*),
        tasks(*)
      `)
    if (visits) setGlobalVisits(visits);
  }
  fetchVisits();
}, [])
```

## Étape 6 : Authentification
Au lieu de vérifier `email === 'ali@...'`, utilisez :
```typescript
const { user, error } = await supabase.auth.signInWithPassword({
  email: 'email@example.com',
  password: 'example-password',
})
```
