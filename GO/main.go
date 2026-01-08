package main

import (
	"encoding/json" //converti json en structure go
	"fmt"
	"log" //pour la gestion des erreurs
	"math"
	"os" //pour ouvrir le fichier json
	"runtime"
	"time"
)

type Node struct {
	Type    string             `json:"type"`
	Lat     float64            `json:"lat"`
	Lon     float64            `json:"lon"`
	Voisins map[string]float64 `json:"voisins"`
}

type DijkstraResult struct {
    Start     string
    Distances map[string]float64
}


func minimum(distances map[string]float64, visite map[string]bool) string {
	vMini := math.Inf(1)
	var kMini string

	for k, v := range distances {
		if !visite[k] && v < vMini {
			vMini = v
			kMini = k
		}
	}

	if kMini == "" {
		return ""
	}
	return kMini
}

func dijkstra(graph map[string]Node, start string) map[string]float64 {
	distances := make(map[string]float64)
	precedent := make(map[string]string)
	visite := make(map[string]bool)
	var attente []string

	for k := range graph {
		distances[k] = math.Inf(1)
		precedent[k] = ""
	}
	distances[start] = 0
	precedent[start] = start
	visite[start] = true

	for voisin, poids := range graph[start].Voisins {
		precedent[voisin] = start
		attente = append(attente, voisin)
		distances[voisin] = distances[start] + poids
	}

	for len(attente) != 0 {
		noeudMini := minimum(distances, visite)
		if noeudMini == "" {
			break
		}

		visite[noeudMini] = true

		newAttente := []string{}
		for _, n := range attente {
			if n != noeudMini {
				newAttente = append(newAttente, n)
			}
		}
		attente = newAttente

		for voisin, poids := range graph[noeudMini].Voisins {
			if !visite[voisin] {
				attente = append(attente, voisin)
			}
			if distances[voisin] > distances[noeudMini]+poids {
				distances[voisin] = distances[noeudMini] + poids
				precedent[voisin] = noeudMini
			}
		}
	}
	fmt.Println("sommet traite :", start)
	return distances
} 

func worker(id int, jobs <-chan string, results chan<- DijkstraResult, graph map[string]Node) {
    for start := range jobs {
        fmt.Printf("Worker %d traite Dijkstra depuis %s\n", id, start)
        dist := dijkstra(graph, start)
        results <- DijkstraResult{Start: start, Distances: dist}
    }
}



func main() {
	

	//dir := "/Users/gaillardou/Desktop/ELP/GO" //chemin vers le fichier
	dir := "/home/lboubaker/ELP-from-git/GO"
	files, err := os.ReadDir(dir)             //liste fichiers et dossiers present dans le dossier
	if err != nil {
		log.Fatal(err) //Si le dossier n’existe pas ou n’est pas accessible ==> le programme affiche l’erreur et s'arrête immédiatement
	}

	for _, file := range files {
		fmt.Println(file.Name(), file.IsDir()) //pour chaque element on affiche le nom + 1 si dossier et 0 si fichier
	}

	content, err := os.ReadFile(dir + "/sortie.json") //ouvre le json et stocke les données dans le tableau content
	if err != nil {
		log.Fatal(err) //Si le fichier n’existe pas ou n’est pas accessible ==> le programme affiche l’erreur et s'arrête immédiatement
	}

	var graph map[string]Node //declare le type graphe (dictionnaire de Node)
	if err := json.Unmarshal(content, &graph); err != nil {
		log.Fatal(err) //lit le texte JSON contenu dans content
		// crée automatiquement les Node
		//remplit la map graph
		//associe chaque clé à son Node
	}

	// Channels
	nb_noeuds:=125
	numWorkers := runtime.NumCPU()
    //numWorkers := 50
	fmt.Println("nb workers ",numWorkers)
	jobs := make(chan string, 500)
	results := make(chan DijkstraResult, 500) // channel pour DijkstraResult

    // Lancer 3 workers
    for w := 1; w <= numWorkers; w++ {
        go worker(w, jobs, results, graph)
    }

	// Start timer
    startTime := time.Now()

    // Job feeder : seulement 10 noeuds
    count := 0
    for start := range graph {
        jobs <- start
        count++
        if count >= nb_noeuds {
            break
        }
    }
    close(jobs)

    // Récupérer les résultats
    allDistances := make(map[string]map[string]float64)
    for i := 0; i < nb_noeuds; i++ {
        res := <-results
        allDistances[res.Start] = res.Distances
    }

    file, err := os.Create("all_distances.json") // crée ou écrase le fichier
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	elapsed := time.Since(startTime)
    fmt.Printf("Temps mis pour traiter 1000 nodes: %s\n", elapsed)

	// Transformer allDistances en JSON indenté
	jsonData, err := json.MarshalIndent(allDistances, "", "  ")
	if err != nil {
		log.Fatal(err)
	}

	// Écrire dans le fichier
	_, err = file.Write(jsonData)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Toutes les distances ont été enregistrées dans all_distances.json")

}
