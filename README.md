# Todolist_pwa
Objectif: Déployer une application todolist en PWA sur mon iphone en moins de 24h.


Cahier des charges:
Pages:

-Taches:
    - Possibilité d'en créer plusieur avec titre (ex: liste de course, tache de la maison, devoir, administratif ...)
    - Possibilité de les partager avec des amis (chaque page "Taches" a la possibilité d'etre partagé en lecture + ecriture)

-Todo:
    - Vérifier le système de notification
    - Ajouter de l'energie / jour => limiter le niveau des taches / jour pour garden (si plus d'energie peux quand meme realiser des taches mais ne conterront pas pour garden)

-Garden:
    -Créer une dizaine d'arbre
    -enelver les bouttons pour s'ajouter de l'xp
    -connecter le conteur de taches avec todo

-Profile:
    - Update UX
    - code d'invitation
    - connection google ?

- Amis:
    - Update UX à la fin

    ------- Ordonner le code --------

    services, constantsn hook, component

    --- ARCHITECTURE CIBLE A FAIRE PARTOUT 
            ✔ service = data access
            ✔ mapper = transformation
            ✔ hook = orchestration
            ✔ UI = propre


    exemple:
src/
  services/
    taskListService.ts        ← Supabase only (API layer)

  mappers/
    taskListMapper.ts         ← transformation data (null → UI safe)

  hooks/
    useTaskLists.ts           ← state + orchestration only

    --- UNE FOIS ARCHITECTURE FAITE 

        ✔ Domain types
                → sans domain model :
                        ❌ ton app devient couplée à Supabase
                        ❌ impossible de changer backend
                        ❌ refactor difficile
                        ❌ bugs silencieux

                → Avec domain model :
                        ✔ ton app est indépendante du backend
                        ✔ tu peux changer Supabase → Firebase → API
                        ✔ logique stable
                        ✔ code lisible

        ✔ supprimer any

            →Problème réel des any
                tu perds l’autocomplétion
                tu peux casser ton app sans erreur TS
                tu ne sais plus ce que contient vraiment un objet
                ton refactor devient dangereux

        ✔ optimiser queries (IMPORTANT A FAIRE !)
            → utile plus tard (scale / perf)
                option 1 (simple)
                    👉 juste optimiser reload partiel

                option 2 (pro)
                    👉 optimistic updates + patch local state

                option 3 (senior)
                    👉 realtime + state normalized (Redux-like)