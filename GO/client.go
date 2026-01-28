package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strings"
)

func main() {

	conn, err := net.Dial("tcp", "localhost:9000") //tente etablir connexion
	if err != nil {
		panic(err) //si ca marche pas on coupe
	}
	defer conn.Close()

	reader := bufio.NewReader(os.Stdin)

	for {
		//Envoie
		fmt.Println("\nEntrez le chemin du fichier JSON :")
		path, _ := reader.ReadString('\n')
		path = strings.TrimSpace(path) // enleve espaces et retours a la ligne

		if _, err := os.Stat(path); os.IsNotExist(err) {
			fmt.Printf("Erreur : Le fichier '%s' est introuvable.\n", path)
			continue // On recommence la boucle sans crash
		}

		fmt.Fprint(conn, path+"\n") // on envoie le chemin au serveur + ajoute \n pour que le serveur sache que l'envoi est fini

		fmt.Println("Envoie, calculs en cours...")

		//Reception
		var result map[string]map[string]float64
		decoder := json.NewDecoder(conn) //recup ce que serveur renvoie

		err := decoder.Decode(&result)
		if err != nil {
			fmt.Println("Erreur lors de la réception des données:", err)
			break
		}

		fileName := filepath.Base(path) // le nom du fichier sans le chemin du dossier
		// On remplace "json_reduit" par "result_apsp"
		outputName := strings.Replace(fileName, "json_reduit", "result_apsp", 1)

		outputPath := filepath.Join("sortie_server", outputName) // chemin sortie : sortie_server/..

		file, _ := json.MarshalIndent(result, "", "  ") //transforme le map en json
		err = os.WriteFile(outputPath, file, 0644)

		if err != nil {
			fmt.Println("Erreur écriture fichier:", err)
		} else {
			fmt.Printf("Succès ! APSP sauvegardé dans '%s' (%d nœuds traités)\n", outputPath, len(result))
		}
	}
}
