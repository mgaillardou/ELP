import promptSync from 'prompt-sync';
export class Joueur {

    constructor(nom) {
        this.nom = nom;   
        this.cartes_main= []
        this.score = 0
        this.score_temp = 0
        this.etat = []
    }

    piocherCarte(paquet){
        const indice = Math.floor(Math.random()*paquet.length);
	    const carte_prise = paquet.splice(indice,1)[0];
        console.log('carte piochée : '+carte_prise)
	    return carte_prise;
    } 
	
    verifCarte(carte){
        if (this.cartes_main.includes(carte)) {
            return 0
        }
        else if (Number.isNaN(parseInt(carte))){
            return 2
        }
        return 1
    }

    verif7Cartes(){
        const numerosPures = this.cartes_main.filter(carte => {
        const estUnNombre = !isNaN(parseInt(carte));
        const estUnBonus = carte.toString().includes('+') || carte.toString().includes('x');
        return estUnNombre && !estUnBonus;
        });
        return numerosPures
    }
    
    recupereCarteSpeciale(carte, paquet, liste_joueurs) {
    const prompt = promptSync();

    if (carte === 'chance') {
        this.cartes_main.unshift(carte);
        console.log('Tu as une deuxième vie !');
    } 
    else if (carte === 'x2') {
        this.cartes_main.push(carte);
        console.log('Tu peux doubler le score de cette manche.');
    } 
    else {
        const ciblesPossibles = liste_joueurs;
        const nomsCibles = ciblesPossibles.map(j => j.nom);
        
        if (ciblesPossibles.length === 0) {
            console.log(`Tu as pioché ${carte}, mais tu es seul en jeu. La carte est défaussée.`);
            return;
        }

        let choix = "";
        let victime = null;

        while (!victime) {
            console.log(`Tu as la carte spéciale : ${carte}`);
            choix = prompt(`À qui veux-tu la donner ? (${nomsCibles.join(', ')}) : `);
            
            victime = ciblesPossibles.find(j => j.nom === choix);

            if (!victime) {
                console.log("Nom invalide. Merci de choisir un joueur dans la liste.");
            }
        }

        if (carte === 'freeze') {
            victime.etat.push(carte);
            console.log(`${victime.nom} est gelé !`);
        } 
        else {
            console.log(`${victime.nom} subit un FLIP et doit jouer 3 fois !`);
            for (let i = 0; i < 3; i++) {
                let estMort = victime.jouerTour(paquet, liste_joueurs);
                if (estMort) {
                    break; 
                }
                if (victime.cartes_main.length === 0) break;
            }
            return false; 
        }
    }
}
    
    jouerTour(paquet, liste_joueurs) {

        let carte = this.piocherCarte(paquet);
        let test = this.verifCarte(carte);
        
        if (test === 1) {
            this.cartes_main.push(carte);
            this.ajouteScoreTemp(carte);
            return false; 
        }
        else if (test === 0) {
            if (this.cartes_main[0] === 'chance') {
                this.cartes_main.splice(0, 1); 
                console.log("Chance utilisée !");
                return false; 
            } else {
                this.cartes_main = [];
                this.score_temp = 0;
                return true; 
            }
        }
        else {
            // ICI : On renvoie false car piocher une spéciale ne fait pas mourir le tireur
            this.recupereCarteSpeciale(carte, paquet, liste_joueurs);
            return false; 
        }
    }

    ajouteScoreTemp(carte){
        this.score_temp = this.score_temp + parseInt(carte)

    }

    ajouteScore(carte){
        this.score = this.score_temp + this.score
    }

    //attaquer() {
     //   console.log(`${this.nom} attaque avec une force de ${this.force} !`);
    //}

}