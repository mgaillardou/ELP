package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net"
	"os"
	"strings"
	"math"
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
    Start    string
    ResultCh chan DijkstraResult
    Graph    map[string]Node
}

// --- Dijkstra & minimum functions (same as before) ---
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
	fmt.Println("Processed node:", start)
	return distances
}

func handleClient(conn net.Conn, jobs chan Job) {
    defer conn.Close()
    reader := bufio.NewReader(conn)

    msg, err := reader.ReadString('\n')
    if err != nil { return }

    path := strings.TrimSpace(msg)
    graph := loadGraph(path) 
    nodeCount := len(graph)

    resultCh := make(chan DijkstraResult, nodeCount)

    go func() {
        for nodeName := range graph {
            jobs <- Job{Start: nodeName, ResultCh: resultCh, Graph: graph}
        }
    }()

    allResults := make(map[string]map[string]float64)
    fmt.Printf("Début du calcul pour %d nœuds...\n", nodeCount)
    
    for i := 0; i < nodeCount; i++ {
        res := <-resultCh
        allResults[res.Start] = res.Distances
        if i%50 == 0 {
            fmt.Printf("Avancement : %d/%d\n", i, nodeCount)
        }
    }

    // Nettoyage des valeurs +Inf avant l'encodage
    for _, distances := range allResults {
        for destNode, dist := range distances {
            if math.IsInf(dist, 1) {
                distances[destNode] = -1
            }
        }
    }
	encoder := json.NewEncoder(conn)
    err = encoder.Encode(allResults)
    if err != nil {
        fmt.Println("Erreur lors de l'envoi du JSON:", err)
    }
	
    fmt.Println("Calcul APSP terminé et envoyé.")
}

func worker(id int, jobs <-chan Job) {
    for job := range jobs {
        distances := dijkstra(job.Graph, job.Start)
        job.ResultCh <- DijkstraResult{
            Start:     job.Start,
            Distances: distances,
        }
    }
}

// --- Main ---
func main() {
    numWorkers := 4
    jobs := make(chan Job, 100)

    for w := 1; w <= numWorkers; w++ {
        go worker(w, jobs)
    }

    ln, err := net.Listen("tcp", ":9000")
    if err != nil { panic(err) }
    fmt.Println("Server listening on :9000")

    for {
        conn, _ := ln.Accept()
        go handleClient(conn, jobs) 
    }
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
