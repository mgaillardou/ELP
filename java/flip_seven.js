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

let liste = [];

for (const l in dico_cartes) 
	{
    const nb = dico_cartes[l];
    const groupe = Array(nb).fill(l);
    liste = [...liste, ...groupe];
}
const joueur1 = new Joueur("marceau");
const prompt = promptSync();
let fini = 0;


while (fini === 0) {
    console.log('tire une carte');
    joueur1.jouerTour(liste)

    if (joueur1.cartes_main.length === 0){
        break
    }
    else{
        let choix = prompt("Veux tu continuer y/n ?");
        if (choix === 'n'){
            fini = 1
        }
    }
}
joueur1.ajouteScore()
console.log(joueur1.score)
console.log('')
console.log('fin de tour')





