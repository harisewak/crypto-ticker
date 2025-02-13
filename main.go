package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os/exec"
	"runtime"
	"time"
)

//go:embed index.html test.html script.js styles.css
var content embed.FS

func main() {
	port := "3000"
	url := fmt.Sprintf("http://localhost:%s", port)

	// Create a mux for our application
	mux := http.NewServeMux()

	// Serve static files
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if path == "/" {
			path = "/index.html"
		}

		// Handle favicon.ico request
		if path == "/favicon.ico" {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		content, err := content.ReadFile(path[1:])
		if err != nil {
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}

		// Set content type based on file extension
		switch {
		case path[len(path)-3:] == ".js":
			w.Header().Set("Content-Type", "application/javascript")
		case path[len(path)-4:] == ".css":
			w.Header().Set("Content-Type", "text/css")
		case path[len(path)-5:] == ".html":
			w.Header().Set("Content-Type", "text/html")
		}

		w.Write(content)
	})

	// Create a custom HTTP client with proper headers
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Proxy endpoint for CoinDCX
	mux.HandleFunc("/api/coindcx", func(w http.ResponseWriter, r *http.Request) {
		req, err := http.NewRequest("GET", "https://api.coindcx.com/exchange/ticker", nil)
		if err != nil {
			log.Printf("Error creating CoinDCX request: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Add required headers
		req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
		req.Header.Set("Accept", "application/json")

		resp, err := client.Do(req)
		if err != nil {
			log.Printf("Error fetching from CoinDCX: %v", err)
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()

		// Read the response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Printf("Error reading CoinDCX response: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Verify that the response is valid JSON
		var jsonResponse interface{}
		if err := json.Unmarshal(body, &jsonResponse); err != nil {
			log.Printf("Error parsing CoinDCX JSON: %v", err)
			http.Error(w, "Invalid JSON response from CoinDCX", http.StatusBadGateway)
			return
		}

		// Set response headers
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding")

		w.Write(body)
	})

	// Start server in a goroutine
	go func() {
		log.Printf("Starting server at %s", url)
		if err := http.ListenAndServe(":"+port, mux); err != nil {
			log.Fatal(err)
		}
	}()

	// Wait a bit for the server to start
	time.Sleep(100 * time.Millisecond)

	// Open browser
	openBrowser(url)

	// Keep the application running
	select {}
}

func openBrowser(url string) {
	var err error

	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("cmd", "/c", "start", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	default:
		err = fmt.Errorf("unsupported platform")
	}

	if err != nil {
		log.Printf("Error opening browser: %v", err)
	}
}
