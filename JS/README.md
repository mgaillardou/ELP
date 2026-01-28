# Mini-projet Flip 7 en JavaScript

Bienvenue sur ce projet en **JS**, réalisé par Lilia Boubaker et Marceau Gaillardou.

---

## Objectif

L’objectif de ce projet est de prendre en main le langage de programmation JavaScript à travers l’implémentation d’un jeu de cartes, **Flip 7**.  

Ce jeu se joue entre deux joueurs minimum, l'objectif est d'accumuler le plus de points possible par manche afin d'atteindre un score de 200. Pour cela, les joueurs disposent de cartes numéros (1,2,3...) qui rapportent des points et de tout cartes spéciales (`freeze`, `flip`, `chance`...) qui modifient le déroulement de la manche. Chaque joueur peut choisir de continuer ou de se retirer pendant son tour, en fonction de ses cartes et de son score.

---

## Réalisation

Le projet est organisé en deux fichiers :  

- **`joueur.js`** : définit la classe `Joueur`, qui gère les cartes en main, le score temporaire, le score total, la vérififcation des cartes et les actions possibles pendant un tour.  
- **`main.js`** : contient la boucle principale du jeu, la gestion des tours, la vérification de fin de manche et le calcul du gagnant.  

Le jeu fonctionne de la manière suivante :  

1. Un **paquet de cartes** est généré automatiquement en fonction d’un dictionnaire (`dico_cartes`) qui contient toutes les cartes et leur nombre.  
2. Chaque joueur reçoit ses cartes et joue à tour de rôle tant qu’il n’a pas choisi de se retirer ou que ses cartes ne sont pas épuisées.  
3. Les effets spéciaux des cartes (`chance`,`flip`, `freeze`) sont appliqués immédiatement pendant le tour du joueur.
4. Si un joueur se retire, son **score temporaire** est validé et ajouté à son score total, éventuellement modifié par les bonus de cartes.  
5. Les joueurs perdent la manche automatiquement si leurs cartes sont épuisées ou si un effet spécial les bloque.  
6. À la fin de chaque manche, les scores et les cartes de chaque joueur sont **enregistrés dans un fichier `.txt` quotidien**, pour conserver l’historique des parties.
---

## Exécution

Pour lancer le jeu, installez d’abord le module `prompt-sync` :

```bash
npm install prompt-sync
```
Ensuite afin de commencer le jeu, exécuter le script `flip_seven.js` :
```bash
node flip_seven.js
```
Rensignez les prénoms des joueurs et vous êtes prêts à jouer !