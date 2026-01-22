//npm install mot-sync

const inventaire = {
    "a": 14, "b": 4, "c": 7, "d": 5, "e": 19, "f": 2, "g": 4, 
    "h": 2, "i": 11, "j": 1, "k": 1, "l": 6, "m": 5, "n": 9, 
    "o": 8, "p": 4, "q": 1, "r": 10, "s": 7, "t": 9, "u": 8, 
    "v": 2, "w": 1, "x": 1, "y": 1, "z": 2
};

let liste = [];

for (const l in inventaire) 
	{
    const nb = inventaire[l];
    const groupe = Array(nb).fill(l);
    liste = [...liste, ...groupe];
}

//console.log(liste);
console.log(`Total de lettres : ${liste.length}`);
console.log('')

const piocherLettre = (liste) => {
	const indice = Math.floor(Math.random()*liste.length);
	const valeur_prise = liste.splice(indice,1)[0];
	return valeur_prise;
}

const creerTableau = (taille = 9, tab = []) => {
	for (let i=0; i<8; i++){
		const ligne = Array(taille).fill(0);
		tab.push(ligne);
	}
	return(tab);
}

const verifie_Mot_Bon = (lettres_piochees, mot) => {
	if (mot.length < 3) {
		return [0,lettres_piochees]
	}
	let lettres_dispos = [...lettres_piochees];
	let verif = 0
	for (let i=0; i<mot.length;i++){
		if (lettres_dispos.includes(mot[i])){
			for (let j=0; j<lettres_dispos.length;j++){
				if (mot[i] === lettres_dispos[j]){
					lettres_dispos.splice(j, 1);
					verif ++;
					break;
				}
			}
		}
	
	}
	if (verif === mot.length){
		lettres_piochees = lettres_dispos
		return [1,lettres_dispos]
	}
	return [0,lettres_piochees]
}

const verifChoixJoueur = (choix, tab, lettres_en_main) => {
    if (choix === 'a') {
        let numLigne = parseInt(prompt("Quelle ligne veux-tu modifier (0-7) ? "));
        if (isNaN(numLigne) || numLigne < 0 || numLigne > 7 || tab[numLigne][0] === 0) {
            console.log("❌ Ligne invalide ou vide.");
            return [0, lettres_en_main];
        }

        let anciennesLettres = tab[numLigne].filter(c => c !== 0);
        console.log(`Lettres à conserver : ${anciennesLettres.join('')}`);
        let nouveauMot = prompt("Tape le nouveau mot complet : ");

        // Vérifier qu'on n'a pas enlevé de lettres existantes
        let copieNouveau = nouveauMot.split('');
        let testAnciennes = true;
        anciennesLettres.forEach(L => {
            let idx = copieNouveau.indexOf(L);
            if (idx !== -1) copieNouveau.splice(idx, 1);
            else testAnciennes = false;
        });

        if (!testAnciennes) {
            console.log("❌ Erreur : Tu dois garder toutes les lettres d'origine !");
            return [0, lettres_en_main];
        }

        // Vérifier que le surplus est dans la main (minLettres = 0 ici)
        let [valide, reste] = verifie_Mot_Bon(lettres_en_main, copieNouveau.join(''), 0);
        if (valide) {
            tab[numLigne].fill(0);
            nouveauMot.split('').forEach((l, i) => { if(i < 9) tab[numLigne][i] = l; });
            return [1, reste];
        } else {
            console.log("❌ Tu n'as pas les lettres en main pour compléter.");
            return [0, lettres_en_main];
        }
    } 
    else if (choix === 'b') {
        let mot = prompt("Nouveau mot (min 3 lettres) : ");
        let [valide, reste] = verifie_Mot_Bon(lettres_en_main, mot, 3);
        if (valide) {
            remplissageTableau(tab, mot);
            return [1, reste];
        }
        console.log("❌ Mot invalide.");
        return [0, lettres_en_main];
    }
    return [0, lettres_en_main];
};

const remplissageTableau = (tab, mot) => {
	let indice = 0;
	for (let i = 0; i<tab.length; i++){
		if (tab[i][0] === 0){
			indice = i;
			break;
		}
	}
	for (let j = 0; j<mot.length; j++){
		tab[indice][j] = mot[j]
	}
	return tab
}

const piocherLettreDepart = (liste, lettres_dispos) => {
	for (let i=0; i < 5;i++){
	lettre = piocherLettre(liste);
	lettres_dispos.push(lettre);
	}
}

const afficherTableau = (tab) => {
	console.log('VOICI TON TABLEAU')
	for ( let i = 0; i < 8;i++ ) {
		tab[i].forEach((lettre, j) => {
			process.stdout.write(lettre + ' ');
			})
		console.log('');
	}
	console.log('')
}

tab = creerTableau();
afficherTableau(tab);

let test = 0;
let lettres_dispos = [];
const prompt = require('prompt-sync')();
let fini = 0;
piocherLettreDepart(liste, lettres_dispos);

while (fini === 0) {
    console.log('Tes lettres : ' + lettres_dispos.join(' '));
    let mot = prompt("Quel mot proposes-tu ? (ou 'pass') : ");

    if (mot === 'pass') {
        console.log("Tu passes ton tour.");
        // Ici, on ne met pas break si on veut continuer à jouer le tour d'après
        // On laisse juste la boucle recommencer
    } 
    else {
        let [valide, reste] = verifie_Mot_Bon(lettres_dispos, mot);

        if (valide === 1) {
            console.log(`"${mot}" ajouté.`);
            remplissageTableau(tab, mot);
            lettres_dispos = reste;

            let n = piocherLettre(liste);
            if (n) lettres_dispos.push(n);
            afficherTableau(tab);

            let tourEnCours = true;
            let quitterTout = false; // <--- On crée cette variable

            while (tourEnCours) {
				console.log('Tes lettres : ' + lettres_dispos.join(' '));
                console.log('\nQue veux-tu faire maintenant ?');
                console.log('a) Modifier | b) Nouveau | c) Terminer tour (Quitter)');
                
                let choix = prompt("Ton choix (a/b/c) : ");

                if (choix === 'c') {
                    quitterTout = true; // On signale qu'on veut sortir
                    break; // On sort de la boucle "tourEnCours"
                } 
                else if (choix === 'a' || choix === 'b') {
                    let [succes, nouveauReste] = verifChoixJoueur(choix, tab, lettres_dispos);
                    if (succes === 1) {
                        lettres_dispos = nouveauReste;
                        let n2 = piocherLettre(liste);
                        if (n2) lettres_dispos.push(n2);
                        afficherTableau(tab);
                    }
                }
            }

            // Si on a tapé 'c', on utilise le signal pour sortir de la boucle principale
            if (quitterTout) {
                console.log("Fin du tour demandée.");
                // Si tu veux arrêter le JEU : fini = 1;
                // Si tu veux juste passer au tour SUIVANT : continue;
                break; 
            }

        } else {
            console.log("Mot incorrect.");
        }
    }

    if (tab[7][0] !== 0) {
        fini = 1;
        console.log("Grille terminée");
    }
}
console.log('')
console.log('fin de tour')
