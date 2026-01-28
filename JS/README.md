# Mini-projet Flip 7 en JavaScript

Bienvenue sur ce projet en **JS**, réalisé par Lilia Boubaker et Marceau Gaillardou.

---

## Objectif

L’objectif de ce projet est de prendre en main le langage de programmation JavaScript à travers l’implémentation d’un jeu de cartes, **Flip 7**.  

Ce jeu consiste à accumuler le moins de points possible tout en utilisant des cartes spéciales qui peuvent modifier le cours du jeu, comme `x2`, `freeze`, `flip` ou `chance`. Les règles s’inspirent d’un mélange de jeux de cartes classiques avec des effets supplémentaires pour rendre la partie plus stratégique et interactive.

---

## Réalisation

Le projet est organisé autour de plusieurs modules :  

- **`joueur.js`** : définit la classe `Joueur` et les méthodes permettant de jouer un tour, gérer les cartes et le score.  
- **`main.js`** : contient la boucle principale du jeu et gère l’alternance des tours entre les joueurs.  
- **`prompt-sync`** : utilisé pour récupérer la saisie utilisateur dans le terminal de façon synchrone.

### Principaux concepts implémentés

1. **Paquet de cartes dynamique**  
   - Les cartes sont définies dans un dictionnaire avec leur nombre d’exemplaires.  
   - Un mélange aléatoire (`shuffle`) est effectué à chaque génération de paquet pour garantir l’imprévisibilité des tirages.

2. **Gestion des tours de jeu**  
   - Les joueurs actifs jouent à tour de rôle.  
   - Chaque joueur peut choisir de continuer ou de se retirer de la manche.  
   - Les effets spéciaux (`x2`, `freeze`, etc.) sont appliqués selon la situation du joueur.

3. **Score et fin de manche**  
   - Les points sont cumulés à chaque manche.  
   - Le jeu continue jusqu’à ce qu’un joueur atteigne 200 points.  
   - À la fin, le joueur ayant le score le plus bas (ou respectant les règles de Flip 7) est déclaré gagnant.

4. **Interaction utilisateur**  
   - Les entrées sont récupérées via `prompt-sync` pour permettre aux joueurs de saisir `y` ou `n` pour continuer leur tour.  
   - Les cartes en main et le score temporaire sont affichés à chaque tour pour informer les joueurs.

---

## Exécution

Pour lancer le jeu, il faut d’abord installer le module `prompt-sync` :

```bash
npm install prompt-sync
