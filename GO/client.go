package main

import (
	"bufio"
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
	serverReader := bufio.NewReader(conn)

	for {
		fmt.Println("Enter source and target nodes (e.g., A C):")
		input, _ := reader.ReadString('\n')
		fmt.Fprint(conn, input)

		response, _ := serverReader.ReadString('\n')
		fmt.Println("Server response:", response)
	}
}
