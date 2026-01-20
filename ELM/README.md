<h1>Mini-projet TcTurtle</h1>

Bienvenue au Mini-projet TcTurtle de Lilia Boubaker et Marceau Gaillardou.

Le but de ce projet est de créer une page web à l'aide du langage de programmation ELM. Nous avons créé une application web, inspirée de celle proposée par le professeur. Cette dernière nous permet de dessiner des formes à l'aide du module Turtle, en tapant des commandes dans une barre.

<h2>Généralités</h2>

Le code permettant de réaliser cela possède le chemin d'accès suivant : <code>../projet/src/Main.elm</code>.

Dans ce code, nous avons commencé par définir les commandes que nous pouvons entrer pour réaliser le dessin, cela à l'aide de <code>type Command</code>. Ensuite, pour encadrer la syntaxe, nous avons utilisé le module <code>Parser</code>.

Puis nous avons défini la logique de la tortue. Ce code transforme une liste d'instructions de déplacement en une suite de coordonnées $(x, y)$ en calculant la nouvelle position par trigonométrie à chaque pas. 



Il utilise un accumulateur <code>foldl</code> pour mémoriser la position et l'angle actuels de la "tortue" afin de tracer le chemin complet point par point.

Le bout de code d'après gère l'état de l'application en transformant en temps réel le texte saisi par l'utilisateur en une liste de commandes exploitables à l'aide de <code>init</code>. Si le texte est valide, il met à jour le dessin (commands) avec <code>update</code>, sinon il déclenche un indicateur d'erreur pour avertir l'utilisateur.



Enfin, la dernière partie génère l'interface utilisateur en transformant la liste de coordonnées en un dessin géométrique via une balise SVG <code>polyline</code>.
La fonction <code>view</code> assemble ensuite les éléments HTML : elle affiche un champ de saisie stylisé (qui devient rouge en cas d'erreur) et le rendu visuel du tracé de la tortue.



<h2>Améliorations</h2>