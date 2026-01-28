package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net"
	"os"
)

func main() {
	conn, err := net.Dial("tcp", "localhost:9000")
	if err != nil {
		panic(err)
	}
	defer conn.Close()

	reader := bufio.NewReader(os.Stdin)

	for {
		fmt.Println("\nEntrez le chemin du fichier JSON :")
		path, _ := reader.ReadString('\n')
		fmt.Fprint(conn, path)

		fmt.Println("Calcul en cours sur le serveur... (Patientez)")

		// On utilise un décodeur JSON directement sur la connexion
		// Cela permet de lire des gigaoctets si nécessaire sans freeze
		var result map[string]map[string]float64
		decoder := json.NewDecoder(conn)

		err := decoder.Decode(&result)
		if err != nil {
			fmt.Println("Erreur lors de la réception des données:", err)
			break
		}

		// Sauvegarde propre en format JSON indenté
		file, _ := json.MarshalIndent(result, "", "  ")
		err = os.WriteFile("sortie_server/result_apsp.json", file, 0644)

		if err != nil {
			fmt.Println("Erreur écriture fichier:", err)
		} else {
			fmt.Printf("Succès ! APSP sauvegardé dans 'result_apsp.json' (%d nœuds traités)\n", len(result))
		}
	}
}
