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

    if (carte === 'chance') return this.carteChance();
    if (carte === 'x2') return this.carteX2();

    const victimes = this.getCibles(carte, liste_joueurs);
    if (victimes.length === 0) {
        console.log(`Tu as pioché ${carte}, mais il n'y a plus d'adversaire. La carte est défaussée.`);
        return;
    }

    const victime = this.choisirVictime(carte, victimes, prompt);

    if (carte === 'freeze') this.carteFreeze(victime);
    else if (carte === 'flip') this.carteFlip(victime, paquet, liste_joueurs);
    }

    carteChance() {
        this.cartes_main.unshift('chance');
        console.log('Tu as une deuxième vie !');
    }

    carteX2() {
        this.cartes_main.push('x2');
        console.log('Tu peux doubler le score de cette manche.');
    }

    getCibles(carte, liste_joueurs) {
        if (carte === 'freeze') {
            return liste_joueurs.filter(j => j.nom !== this.nom);
        }
        return liste_joueurs;
    }

    choisirVictime(carte, ciblesPossibles, prompt) {
        const nomsCibles = ciblesPossibles.map(j => j.nom);
        let victime = null;
        while (!victime) {
            console.log(`Tu as la carte spéciale : ${carte}`);
            const choix = prompt(`À qui veux-tu la donner ? (${nomsCibles.join(', ')}) : `);
            victime = ciblesPossibles.find(j => j.nom === choix);
            if (!victime) console.log("Nom invalide. Merci de choisir un joueur dans la liste.");
        }
        return victime;
    }

    carteFreeze(victime) {
        victime.etat.push('freeze');
        console.log(`${victime.nom} est gelé !`);
    }

    carteFlip(victime, paquet, liste_joueurs) {
        console.log(`${victime.nom} subit un flip et doit piocher 3 fois !`);
        for (let i = 0; i < 3; i++) {
            const estMort = victime.jouerTour(paquet, liste_joueurs);
            if (estMort || victime.cartes_main.length === 0) {
                console.log(`${victime.nom} a perdu pendant son FLIP et est éliminé !`);
                const index = liste_joueurs.indexOf(victime);
                if (index > -1) liste_joueurs.splice(index, 1);
                break;
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
}