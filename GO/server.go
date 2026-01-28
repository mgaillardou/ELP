package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"math"
	"net"
	"os"
	"strings"
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

type Job struct {
	Start      string
	resultChan chan DijkstraResult
	Graph      map[string]Node
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
	return kMini
}

func dijkstra(graph map[string]Node, start string) map[string]float64 {
	distances := make(map[string]float64)
	visite := make(map[string]bool)
	var attente []string

	for k := range graph {
		distances[k] = math.Inf(1)
	}
	distances[start] = 0
	visite[start] = true

	for voisin, poids := range graph[start].Voisins {
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
			}
		}
	}
	fmt.Println("Noeuds traités : ", start)
	return distances // APSP pour un noeud
}

func loadGraph(path string) map[string]Node {
	content, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}
	var graph map[string]Node
	if err := json.Unmarshal(content, &graph); err != nil {
		panic(err)
	}
	return graph
}

func handleClient(conn net.Conn, jobs chan Job) {
	defer conn.Close()
	reader := bufio.NewReader(conn)

	msg, err := reader.ReadString('\n')
	if err != nil {
		return
	}

	path := strings.TrimSpace(msg) // enleve espaces et retours a la ligne
	graph := loadGraph(path)
	nbNoeuds := len(graph)

	resultChan := make(chan DijkstraResult, nbNoeuds) // channel de resultats de tailles nbNoeuds

	go func() {
		for nomNoeud := range graph {
			jobs <- Job{Start: nomNoeud, resultChan: resultChan, Graph: graph}
		}
	}()

	resFinal := make(map[string]map[string]float64)
	fmt.Printf("Début du calcul pour %d nœuds...\n", nbNoeuds)

	for i := 0; i < nbNoeuds; i++ { //bloque et att que tous les workers aient finis
		res := <-resultChan
		resFinal[res.Start] = res.Distances
		if i%100 == 0 {
			fmt.Printf("Avancement : %d/%d\n", i, nbNoeuds)
		}
	}

	for _, distances := range resFinal {
		for destNode, dist := range distances {
			if math.IsInf(dist, 1) {
				distances[destNode] = -1 //si distance infinie on renvoie -1
			}
		}
	}

	encoder := json.NewEncoder(conn)
	err = encoder.Encode(resFinal)
	if err != nil {
		fmt.Println("Erreur lors de l'envoi du JSON:", err)
	}

	fmt.Println("Calcul APSP terminé et envoyé.")
}

func worker(id int, jobs <-chan Job) {
	for job := range jobs {
		distances := dijkstra(job.Graph, job.Start)
		job.resultChan <- DijkstraResult{
			Start:     job.Start,
			Distances: distances,
		}
	}
}

// --- Main ---
func main() {
	numWorkers := 20
	jobs := make(chan Job, 100)

	for w := 1; w <= numWorkers; w++ {
		go worker(w, jobs)
	}

	ln, err := net.Listen("tcp", ":9000")
	if err != nil {
		panic(err)
	}
	fmt.Println("Server listening on :9000")

	for {
		conn, _ := ln.Accept()
		go handleClient(conn, jobs)
	}
}
