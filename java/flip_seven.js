//npm install mot-sync
import { Joueur } from './joueur.js';
import promptSync from 'prompt-sync';


const dico_cartes = {
	0:1, 
	1:1,
	2:2,
	3:3,
	4:4,
	5:5,
	6:6,
	7:7,
	8:8,
	9:9,
	10:10,
	11:11,
	12:12,
	"+2":1,
	"+4":1,
	"+6":1,
	"+8":1,
	"+10":1,
	"x2":1,
    "freeze":3,
    "flip":3,
    "chance":3
}

function melanger(paquet) {
    for (let i = paquet.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [paquet[i], paquet[j]] = [paquet[j], paquet[i]];
    }
}

function genererPaquet() {
    let nouveau = [];
    for (const l in dico_cartes) {
        const nb = dico_cartes[l];
        nouveau = [...nouveau, ...Array(nb).fill(l)];
    }
    melanger(nouveau);
    return nouveau;
}

let liste = genererPaquet()

const joueur1 = new Joueur('marceau');
const joueur2 = new Joueur('lilia');

let liste_joueurs = [joueur1, joueur2]
let joueurs_actifs = [...liste_joueurs]; // Copie des joueurs qui n'ont pas encore dit 'n' ou perdu
let index_tour = 0;

const prompt = promptSync();
let fini = 0;


while (liste_joueurs.every(j => j.score < 200)) {
    console.log("\n==========================");
    console.log("   NOUVELLE MANCHE !");
    console.log("==========================");
    
    let joueurs_actifs = [...liste_joueurs];
    let index_tour = 0;

	while (joueurs_actifs.length > 0) {

		if (liste.length < 5) {
            console.log("paquet vide");
            liste = genererPaquet();
        }

		let position = index_tour % joueurs_actifs.length;
		let joueur_actuel = joueurs_actifs[position];

		console.log(`\nC'est au tour de : ${joueur_actuel.nom.toUpperCase()}`);

		console.log('cartes :' + joueur_actuel.cartes_main)
		console.log('score temp '+ joueur_actuel.score_temp)

		let choix = prompt("Veux tu continuer y/n ?");

		if (choix === 'n'){
				console.log(`${joueur_actuel.nom} se retire de la manche.`);

				if (joueur_actuel.verif7Cartes().length >= 7){
					joueur_actuel.score_temp += 15
				}
				if (joueur_actuel.cartes_main.includes('x2')){
					joueur_actuel.score_temp = joueur_actuel.score_temp*2
				}

				joueur_actuel.etat = []
				joueur_actuel.ajouteScore(); // Il valide ses points
				joueurs_actifs.splice(position, 1);
				joueur_actuel.cartes_main= []
        		joueur_actuel.score_temp = 0
        
			}
			else {
				joueur_actuel.jouerTour(liste,liste_joueurs)
				if (joueur_actuel.cartes_main.length === 0 || joueur_actuel.etat.includes("freeze")){
					joueurs_actifs.splice(position, 1);
					console.log(`💥 ${joueur_actuel.nom} a perdu et s'arrête pour cette manche.`);
					joueur_actuel.etat = []
					joueur_actuel.cartes_main= []
        			joueur_actuel.score_temp = 0
				}
				else {
					index_tour ++	
				}
			}
		}
	console.log('')
	console.log('fin de manche')
	liste_joueurs.forEach(j => console.log(`Score de ${j.nom} : ${j.score}`));
}
	

const gagnant = liste_joueurs.reduce((prev, curr) => (prev.score > curr.score) ? prev : curr);
console.log(`\n🏆 VICTOIRE DE ${gagnant.nom.toUpperCase()} avec ${gagnant.score} points ! 🏆`);

