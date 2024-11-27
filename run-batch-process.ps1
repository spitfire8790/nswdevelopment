# Configuration
$baseUrl = "http://localhost:3000"
$maxRetries = 3
$retryDelay = 5 # seconds
$monitorInterval = 10 # seconds

function Start-BatchProcess {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/batch-process" -Method GET -TimeoutSec 30
        return $response
    }
    catch {
        Write-Host "❌ Failed to start batch process: $_" -ForegroundColor Red
        exit 1
    }
}

function Get-ProcessStatus {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/batch-process/status" -Method GET
        return $response
    }
    catch {
        Write-Host "⚠️ Failed to get status: $_" -ForegroundColor Yellow
        return $null
    }
}

# Start the process
Write-Host "`n🚀 Starting batch process..." -ForegroundColor Cyan
$startResponse = Start-BatchProcess

if ($startResponse) {
    Write-Host "✅ Process started successfully" -ForegroundColor Green
    
    # Monitor progress
    $running = $true
    while ($running) {
        $status = Get-ProcessStatus
        
        if ($status) {
            Clear-Host
            Write-Host "=== Batch Process Monitor ===" -ForegroundColor Cyan
            Write-Host "Current Council: $($status.currentCouncil)" -ForegroundColor Yellow
            Write-Host "Progress: $($status.progress)%" -ForegroundColor Green
            Write-Host "Councils Processed: $($status.processedCount)" -ForegroundColor Cyan
            
            if ($status.errors.Count -gt 0) {
                Write-Host "`nErrors:" -ForegroundColor Red
                foreach ($error in $status.errors) {
                    Write-Host "- $($error.council): $($error.message)" -ForegroundColor Red
                }
            }
            
            if ($status.status -eq 'complete') {
                $running = $false
                Write-Host "`n✅ Process Complete!" -ForegroundColor Green
            }
        }
        
        Start-Sleep -Seconds $monitorInterval
    }
}