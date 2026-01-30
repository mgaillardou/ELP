//npm install mot-sync
import { Joueur } from './joueur.js';
import promptSync from 'prompt-sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Pour recréer __dirname en mode module (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOSSIER_JOUEUR = path.join(__dirname, 'resume_partie');

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
	"flip":10,
	"chance":3
}


function genererPaquet() {
	let nouveau = [];
	for (const l in dico_cartes) {
		const nb = dico_cartes[l];
		nouveau = [...nouveau, ...Array(nb).fill(l)];
	}
	return nouveau;
}


function enregistrerAction(playerId, action) {
	if (!fs.existsSync(DOSSIER_JOUEUR)) {
		fs.mkdirSync(DOSSIER_JOUEUR, { recursive: true });
	}

	const nomFichier = `${playerId}.txt`;
	const cheminComplet = path.join(DOSSIER_JOUEUR, nomFichier);
		const contenu = `${action}`;

	try {
		fs.appendFileSync(cheminComplet, contenu);
	} catch (err) {
		console.error(`Erreur d'écriture pour le joueur ${playerId}:`, err.message);
	}
}

function viderDossierresumePartie() {
	try {
		if (!fs.existsSync(DOSSIER_JOUEUR)) {
			fs.mkdirSync(DOSSIER_JOUEUR, { recursive: true });
			return;
		}
		const fichiers = fs.readdirSync(DOSSIER_JOUEUR);

		for (const fichier of fichiers) {
			const cheminFichier = path.join(DOSSIER_JOUEUR, fichier);
			fs.unlinkSync(cheminFichier);
		}
		console.log("Dossier de résumé nettoyé avec succès.");
	} catch (err) {
		console.error("Erreur lors du nettoyage du dossier :", err.message);
	}
}

function calculerProbaPerdre(joueur, paquet) {
    if (paquet.length === 0) {
		return "0.0";
	}
    if (joueur.cartes_main.includes('chance')) {
		return "0.0";
	}
    const valeursEnMain = joueur.cartes_main.filter(c => !isNaN(c));
    const cartesFatalesRestantes = paquet.filter(carte => 
        valeursEnMain.includes(carte)
    ).length;

    const proba = (cartesFatalesRestantes / paquet.length) * 100;

    return proba.toFixed(1);
}

viderDossierresumePartie()

let liste = genererPaquet();
const prompt = promptSync(); 
let liste_joueurs = [];

console.log("\n--- INSCRIPTION DES JOUEURS ---");
console.log("(Laisse vide ou tape 'fin' pour terminer l'ajout)");

while (true) {
    let nom = prompt(`Nom du joueur ${liste_joueurs.length + 1} : `).trim();
    if (nom.toLowerCase() === "fin" || nom === "") {
        if (liste_joueurs.length < 2) {
            console.log("⚠️ Il faut au moins 2 joueurs pour commencer la partie !");
            continue;
        }
        break; 
    }
    const nouveauJoueur = new Joueur(nom);
    liste_joueurs.push(nouveauJoueur);
    console.log(`✅ ${nom} a été ajouté.`);
}

console.log(`\nLa partie commence avec : ${liste_joueurs.map(j => j.nom).join(', ')}`);
let manche = 1;

while (liste_joueurs.every(j => j.score < 200)) {

	console.log("\n==========================");
	console.log("   NOUVELLE MANCHE !");
	console.log("==========================");
	liste_joueurs.forEach(joueur => {
		enregistrerAction(joueur.nom, `manche ${manche}\n`);
	});

	let joueurs_actifs = [...liste_joueurs];
	let index_tour = 0;

	while (joueurs_actifs.length > 0) {

		let position = index_tour % joueurs_actifs.length;
		let joueur_actuel = joueurs_actifs[position];

		if (joueur_actuel.etat.includes("freeze")) {
			console.log(`\n  ${joueur_actuel.nom} est gelé, il a perdu et s'arrête pour cette manche.`);
			
			enregistrerAction(joueur_actuel.nom, 'gelé, perdu : 0 points\n');
			enregistrerAction(joueur_actuel.nom, `score total : ${joueur_actuel.score}\n`);

			joueur_actuel.etat = [];
			joueur_actuel.cartes_main = [];
			joueur_actuel.score_temp = 0;
			joueurs_actifs.splice(position, 1);
			continue; 
		}

		if (liste.length < 5) {
			console.log("paquet vide");
			liste = genererPaquet();
		}

		console.log(`\nC'est au tour de : ${joueur_actuel.nom}`);
		console.log('cartes :' + joueur_actuel.cartes_main);
		enregistrerAction(joueur_actuel.nom, `cartes : ${joueur_actuel.cartes_main}\n`);

		console.log('score temp ' + joueur_actuel.score_temp);
		enregistrerAction(joueur_actuel.nom, `score : ${joueur_actuel.score_temp}\n`);

		let choix = "";
		
		const p = calculerProbaPerdre(joueur_actuel, liste);
		console.log('Proba de perdre : '+p)

		while (choix !== "y" && choix !== "n") {
			choix = prompt("Veux-tu continuer ? (y/n) ").toLowerCase();
			if (choix !== "y" && choix !== "n") {
				console.log("Réponse invalide. Merci de taper 'y' pour oui ou 'n' pour non");
			}
		}

		enregistrerAction(joueur_actuel.nom, `choix de continuer : ${choix}\n`);

		if (choix === 'n') {
			console.log(`${joueur_actuel.nom} se retire de la manche`);
			enregistrerAction(joueur_actuel.nom, 'se retire de la manche\n');

			if (joueur_actuel.verif7Cartes().length >= 7) {
				joueur_actuel.score_temp += 15;
				enregistrerAction(joueur_actuel.nom, 'FLIP SEVEN : +15 points\n');
			}
			if (joueur_actuel.cartes_main.includes('x2')) {
				joueur_actuel.score_temp *= 2;
				enregistrerAction(joueur_actuel.nom, 'x2 : double le score de la manche\n');
			}

			joueur_actuel.etat = [];
			joueur_actuel.ajouteScore(); 
			enregistrerAction(joueur_actuel.nom, `score total : ${joueur_actuel.score}\n`);
			joueurs_actifs.splice(position, 1);
			joueur_actuel.cartes_main = [];
			joueur_actuel.score_temp = 0;
		} 
		else {

			let perdu = joueur_actuel.jouerTour(liste, joueurs_actifs);
			
			if (perdu) {
				joueurs_actifs.splice(position, 1);
				console.log(`${joueur_actuel.nom} a perdu et s'arrête pour cette manche.`);
				enregistrerAction(joueur_actuel.nom, 'perdu : 0 points\n');
				enregistrerAction(joueur_actuel.nom, `score total : ${joueur_actuel.score}\n`);
				
				joueur_actuel.etat = [];
				joueur_actuel.cartes_main = [];
				joueur_actuel.score_temp = 0;
			} else {
				index_tour++;   
			}
		}
	}

	console.log('\nfin de manche');
	liste_joueurs.forEach(j => {
		console.log(`Score de ${j.nom} : ${j.score}`);
		enregistrerAction(j.nom, 'fin de manche\n');
		enregistrerAction(j.nom, '\n\n');
	});
	manche++;
}

const gagnant = liste_joueurs.reduce((prev, curr) => (prev.score > curr.score) ? prev : curr);
console.log(`\nVictoire de ${gagnant.nom.toUpperCase()} avec ${gagnant.score} points !`);

