# Function to kill process using a specific port
function Kill-ProcessByPort {
    param($port)
    $processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
    if ($processId) {
        Write-Host "Killing process using port $port"
        taskkill /PID $processId /F
    }
}

# Kill any processes using our ports
Kill-ProcessByPort 3001  # Backend port
Kill-ProcessByPort 8080  # Frontend port

# Wait a moment for ports to be freed
Start-Sleep -Seconds 2

Write-Host "Starting development servers..."

# Start backend server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location backend; npm install; npm run dev" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 5

# Start frontend server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm install; npm run dev" -WindowStyle Normal

Write-Host "Development servers started!"
Write-Host "Frontend: http://localhost:8080"
Write-Host "Backend: http://localhost:3001"
Write-Host "Press Ctrl+C in the respective windows to stop the servers" 