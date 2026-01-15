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
	Dest     string
	ResultCh chan DijkstraResult
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

// --- Worker pool ---
func worker(id int, jobs <-chan Job, graph map[string]Node) {
	for job := range jobs {
		fmt.Printf("Worker %d computing Dijkstra from %s\n", id, job.Start)
		distances := dijkstra(graph, job.Start)
		job.ResultCh <- DijkstraResult{
			Start:     job.Start,
			Distances: map[string]float64{job.Dest: distances[job.Dest]},
		}
	}
}

// --- Client handler (server side) ---
func handleClient(conn net.Conn, jobs chan Job, graph map[string]Node) {
	defer conn.Close()
	reader := bufio.NewReader(conn)

	for {
		msg, err := reader.ReadString('\n')
		if err != nil {
			fmt.Println("Client disconnected")
			return
		}

		msg = strings.TrimSpace(msg)
		parts := strings.Split(msg, " ")
		if len(parts) != 2 {
			conn.Write([]byte("Error: send two nodes, e.g., A C\n"))
			continue
		}

		start, dest := parts[0], parts[1]
		resultCh := make(chan DijkstraResult)

		// Send job to worker pool
		jobs <- Job{Start: start, Dest: dest, ResultCh: resultCh}

		// Wait for result
		result := <-resultCh

		// Send JSON response back to client
		jsonResp, _ := json.Marshal(result)
		conn.Write(append(jsonResp, '\n'))
	}
}

// --- Main ---
func main() {
	graph := loadGraph("/home/lboubaker/ELP-from-git/GO/sortie.json")

	numWorkers := 4
	jobs := make(chan Job, 100)

	// Start worker pool
	for w := 1; w <= numWorkers; w++ {
		go worker(w, jobs, graph)
	}

	// Start TCP server
	ln, err := net.Listen("tcp", ":9000")
	if err != nil {
		panic(err)
	}
	fmt.Println("Server listening on :9000")

	for {
		conn, _ := ln.Accept()
		go handleClient(conn, jobs, graph)
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
