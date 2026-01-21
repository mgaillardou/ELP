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

console.log(liste);
console.log(`Total de lettres : ${liste.length}`);

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

tab = creerTableau();


let test = 0;
let lettres_dispos = [];

console.log('tu disposes de ces lettres là pour faire ton mot')

for (let i=0; i < 5;i++){
	lettre = piocherLettre(liste);
	lettres_dispos.push(lettre);
	process.stdout.write(lettre);
	process.stdout.write(' ');
}
console.log('')
const prompt = require('prompt-sync')();
let mot = prompt("quel mot as-tu trouvé ? ");
let resultat = verifie_Mot_Bon(lettres_dispos, mot);

while (test === 0){ 

	while (resultat[0]===0 && mot != 'pass'){
		mot = prompt("reessaye encore, quel mot as-tu trouvé ? ");
		resultat = verifie_Mot_Bon(lettres_dispos, mot);
	}
	
	console.log(mot);
	if (mot === 'pass'){
		console.log('c est pas grave d abandonner');
	}
	else{
		console.log('bravo ça marche');
		remplissageTableau(tab, mot);
		lettres_dispos = resultat[1];
	}
	if (tab[3][0] !== 0){
		test = 1;
	}
	else{
		console.log('tu disposes de ces lettres là pour faire ton mot')
		lettre = piocherLettre(liste);
		lettres_dispos.push(lettre);
		for (let i=0; i<lettres_dispos.length; i++){
			process.stdout.write(lettres_dispos[i]);
			process.stdout.write(' ');
		}
	}
	
}
console.log(lettres_dispos)