//npm install prompt-sync

const inventaire = {
    "a": 14, "b": 4, "c": 7, "d": 5, "e": 19, "f": 2, "g": 4,
    "h": 2, "i": 11, "j": 1, "k": 1, "l": 6, "m": 5, "n": 9,
    "o": 8, "p": 4, "q": 1, "r": 10, "s": 7, "t": 9, "u": 8,
    "v": 2, "w": 1, "x": 1, "y": 1, "z": 2
};

let liste = [];

for (const l in inventaire) {
    const nb = inventaire[l];
    const groupe = Array(nb).fill(l);
    liste = [...liste, ...groupe];
}

console.log(liste);
console.log(`Total de lettres : ${liste.length}`);
console.log('');

const piocherLettre = (liste) => {
    const indice = Math.floor(Math.random() * liste.length);
    const valeur_prise = liste.splice(indice, 1)[0];
    return valeur_prise;
}

const piocherLettreDepart = (liste, lettres_dispos) => {
	for (let i=0; i < 5;i++){
	lettre = piocherLettre(liste);
	lettres_dispos.push(lettre);
	}
}

const creerTableau = (taille = 9, tab = []) => {
    for (let i = 0; i < 8; i++) {
        const ligne = Array(taille).fill(0);
        tab.push(ligne);
    }
    return (tab);
}

const verifie_Mot_Bon = (lettres_piochees, mot) => {
    if (mot.length === 0) {
        return [0, lettres_piochees]
    }
    let lettres_dispos = [...lettres_piochees];
    let verif = 0
    for (let i = 0; i < mot.length; i++) {
        if (lettres_dispos.includes(mot[i])) {
            for (let j = 0; j < lettres_dispos.length; j++) {
                if (mot[i] === lettres_dispos[j]) {
                    lettres_dispos.splice(j, 1);
                    verif++;
                    break;
                }
            }
        }
    }
    if (verif === mot.length) {
        lettres_piochees = lettres_dispos
        return [1, lettres_dispos]
    }
    return [0, lettres_piochees]
}

const remplissageTableau = (tab, mot) => {
    let indice = 0;
    for (let i = 0; i < tab.length; i++) {
        if (tab[i][0] === 0) {
            indice = i;
            break;
        }
    }
    for (let j = 0; j < mot.length; j++) {
        tab[indice][j] = mot[j]
    }
    return tab
}


const afficherTableau = (tab) => {
    console.log('VOICI TON TABLEAU')
    for (let i = 0; i < 8; i++) {
        tab[i].forEach((lettre, j) => {
            process.stdout.write(lettre + ' ');
        })
        console.log('');
    }
    console.log('')
}

const choix_joueur_b = (tab) => {
    let indice = 0
    for (indice; indice < 7; indice++){
        if (tab[indice][0] === 0){}
    }
}
tab = creerTableau();
afficherTableau(tab)

let lettres_dispos = [];
const prompt = require('prompt-sync')();
console.log('')

console.log('');
let fini = 0;
piocherLettreDepart(liste, lettres_dispos)

while (fini === 0) {
    console.log('Tes lettres :');
    lettres_dispos.forEach((lettre) => {
        process.stdout.write(lettre + ' ');
    });
    console.log('')
    
    let mot = prompt("Quel mot proposes-tu ? (ou 'pass') : ");
    console.log('')
    
    if (mot === 'pass') {
        console.log("Tour passé");
        break
    }
    else {
        let [valide, reste] = verifie_Mot_Bon(lettres_dispos, mot);

        if (valide === 1) {
            console.log(mot + " ajouté.");
            remplissageTableau(tab, mot);
            lettres_dispos = reste;
            let n = piocherLettre(liste);

            let tourEnCours = true;
            let quitterTout = false; 

            while (tourEnCours) {
				console.log('Tes lettres : ' + lettres_dispos.join(' '));
                console.log('\nQue veux-tu faire maintenant ?');
                console.log('a) Modifier | b) Nouveau | c) Terminer tour (Quitter)');
                
                let choix = prompt("Ton choix (a/b/c) : ");

                if (choix === 'c') {
                    quitterTout = true; 
                    break; 
                } 
                elif (choix === 'b') {

                }
            if (n) lettres_dispos.push(n);
            afficherTableau(tab);
            } 

            if (quitterTout) {
                console.log("Fin du tour demandée.");
                break; 
            }
        }
        else {
            console.log('mot incorrect')
        }
    }

    if (tab[7][0] !== 0) {
        fini = 1;
        console.log("grille terminée");
    }
}

console.log('')
console.log('fin de tour')