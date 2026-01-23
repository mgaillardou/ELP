export class Joueur {

    constructor(nom) {
        this.nom = nom;   
        this.cartes_main= []
        this.score = 0
        this.score_temp = 0
    }

    piocherCarte(paquet){
        const indice = Math.floor(Math.random()*paquet.length);
	    const carte_prise = paquet.splice(indice,1)[0];
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
        
    
    jouerTour(paquet){
        let carte = this.piocherCarte(paquet)
        let test = this.verifCarte(carte)
        console.log('carte piochée : '+carte)
        if (test === 1){
            this.cartes_main.push(carte);
            this.ajouteScoreTemp(carte)
            console.log('cartes :' + this.cartes_main)
            console.log('score temp '+ this.score_temp)
        }
        else if (test === 0){
            console.log("Perdu");
            this.cartes_main=[]
            this.score_temp = 0
        }
        else {
            console.log('carte speciale')
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