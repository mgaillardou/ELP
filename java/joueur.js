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
    recupereCarteSpeciale(carte, paquet, liste_joueurs){
        if (carte === 'chance') {
            this.cartes_main.unshift(carte); 
            console.log('tu as une deuxième vie')
        }
        else if (carte === 'x2') {
            this.cartes_main.push(carte); 
            console.log('tu peux doubler le score de cette manche')
        }
        else{
            const prompt = promptSync();
            let choix = prompt('tu as cette carte spéciale : '+carte+' a qui veux tu la donner (1, 2, 3, 4')
            liste_joueurs.forEach((joueur) => {
                if (choix === joueur.nom)
                    if (carte === 'freeze'){
                        joueur.etat.push(carte)
                    }
                    else {
                        for (let i=0; i<3; i++){
                            joueur.jouerTour(paquet, liste_joueurs)
                            if (joueur.cartes_main.length === 0){
                                break
                            }
                        }
                    }
            })
        }
    }
    
    jouerTour(paquet, liste_joueurs){
        let carte = this.piocherCarte(paquet)
        let test = this.verifCarte(carte)
        
        if (test === 1){
            this.cartes_main.push(carte);
            this.ajouteScoreTemp(carte)
            console.log('cartes :' + this.cartes_main)
            console.log('score temp '+ this.score_temp)
        }
        else if (test === 0){
            if (this.cartes_main[0] === 'chance'){
                this.cartes_main.splice(0, 1); 
            }
            else {
                console.log("Perdu");
                this.cartes_main=[]
                this.score_temp = 0
            }
            
        }
        else {
            console.log('carte speciale')
            this.recupereCarteSpeciale(carte, paquet, liste_joueurs)
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