<h1>Mini-projet TcTurtle</h1>

Bienvenue sur le projet **TcTurtle**, réalisé par Lilia Boubaker et Marceau Gaillardou.

L'objectif de ce travail est de concevoir une application web en utilisant le langage **Elm**. Inspirée de l'exemple proposé en cours, notre interface permet de générer des tracés géométriques grâce à un module "Turtle" piloté par une barre de commandes textuelles.

<h2>Généralités</h2>

Le code source de l'application est situé à l'emplacement suivant : <code>../projet/src/Main.elm</code>.

Afin d'exécuter le script, tapez cette commande dans votre terminal : <code>elm make src/Main.elm --output=index.html</code>


Dans ce fichier, nous avons d'abord défini l'ensemble des instructions disponibles via le type <code>type Command</code>. La validation et l'analyse de la syntaxe saisie par l'utilisateur sont assurées par le module <code>Parser</code>.


Ensuite, nous avons implémenté la **logique de la tortue**. Ce module convertit la liste des commandes en une suite de coordonnées $(x, y)$ en calculant, pour chaque étape, la nouvelle position à l'aide de fonctions trigonométriques. 

Le calcul repose sur l'utilisation d'un accumulateur <code>foldl</code>, qui mémorise dynamiquement la position et l'orientation de la tortue pour générer le tracé complet.


La section suivante assure la **gestion de l'état** (Architecture MVU). Elle interprète en temps réel la saisie de l'utilisateur pour mettre à jour le modèle via les fonctions <code>init</code> et <code>update</code>. Si la syntaxe est correcte, les nouvelles commandes sont appliquées au dessin ; dans le cas contraire, un signal d'erreur est activé.


Enfin, la dernière partie est dédiée à l'**interface utilisateur**. Elle traduit les coordonnées calculées en une forme visuelle grâce à la balise SVG <code>polyline</code>. 
La fonction <code>view</code> assemble les composants HTML, intégrant un champ de saisie réactif (dont la bordure devient rouge en cas d'erreur de syntaxe) ainsi que le rendu graphique final du tracé.



<h2>Améliorations apportées</h2>

Par rapport à la version de base, nous avons enrichi l'expérience utilisateur avec deux fonctionnalités majeures :

**1. Animation temporelle** : Grâce au module <code>Time</code> et aux <code>subscriptions</code>, le tracé ne s'affiche plus instantanément mais progressivement. Un signal périodique incrémente le nombre de segments visibles, créant une animation fluide.

**2. Avatar dynamique** : Nous avons intégré une image (<code>tortue.png</code>) qui suit la pointe du tracé. L'utilisation de l'attribut <code>transform</code> permet à l'image de pivoter en temps réel selon l'angle de direction calculé.


<h2>À noter</h2>

Pour les instructions de très grande taille (ex: <code>repeat 1000 [ forward 100 ]</code>), l'application peut subir des ralentissements. Cela est dû à la structure de données utilisée pour stocker le chemin, qui devient très lourde à recalculer et à afficher en temps réel à chaque étape de l'animation.