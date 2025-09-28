# Comprehensive Server Diagnostic Script
# Run this to diagnose all server connectivity issues

Write-Host "🔍 Comprehensive Server Diagnostic" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check if servers are running on expected ports
Write-Host "`n📡 Step 1: Checking Server Processes" -ForegroundColor Yellow
$ports = @(5105, 5001, 5002)
foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($connections) {
            Write-Host "   ✅ Port $port is active (PID: $($connections[0].OwningProcess))" -ForegroundColor Green

            # Try to get process name
            try {
                $process = Get-Process -Id $connections[0].OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "      Process: $($process.ProcessName)" -ForegroundColor Blue
                }
            } catch {
                Write-Host "      Process: Unknown" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ❌ Port $port is not listening" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ⚠️  Could not check port $port" -ForegroundColor Yellow
    }
}

# Test basic connectivity
Write-Host "`n📡 Step 2: Testing Basic Connectivity" -ForegroundColor Yellow

$endpoints = @(
    @{name="GameServer Health"; url="http://localhost:5105/health"},
    @{name="GameServer Character API"; url="http://localhost:5105/api/character/my-characters"},
    @{name="GameServer HTTPS"; url="https://localhost:5001/health"},
    @{name="WorldServer"; url="http://localhost:5002/health"}
)

foreach ($endpoint in $endpoints) {
    Write-Host "   Testing $($endpoint.name)..." -ForegroundColor Blue
    try {
        $response = Invoke-WebRequest -Uri $endpoint.url -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "      ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $errorMessage = $_.Exception.Message
        if ($errorMessage -match "Connection refused|ConnectFailure") {
            Write-Host "      ❌ Connection Refused - Server not running" -ForegroundColor Red
        } elseif ($errorMessage -match "timeout") {
            Write-Host "      ⏱️  Timeout - Server may be slow" -ForegroundColor Yellow
        } elseif ($errorMessage -match "500") {
            Write-Host "      ⚠️  Server Error (500) - Server running but has issues" -ForegroundColor Yellow
        } else {
            Write-Host "      ❌ Error: $errorMessage" -ForegroundColor Red
        }
    }
}

# Check Windows Firewall
Write-Host "`n🛡️  Step 3: Checking Windows Firewall" -ForegroundColor Yellow
try {
    $firewallStatus = Get-NetFirewallProfile | Select-Object Name, Enabled
    foreach ($profile in $firewallStatus) {
        $status = if ($profile.Enabled) { "🔴 ON" } else { "🟢 OFF" }
        Write-Host "   $($profile.Name): $status" -ForegroundColor $(if ($profile.Enabled) { "Red" } else { "Green" })
    }

    if ($firewallStatus | Where-Object { $_.Enabled -eq $true }) {
        Write-Host "   💡 Firewall is enabled - may block localhost connections" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Could not check firewall status" -ForegroundColor Yellow
}

# Check antivirus interference
Write-Host "`n🦠 Step 4: Common Issues Check" -ForegroundColor Yellow

# Check if any process is using the ports
foreach ($port in $ports) {
    try {
        $allConnections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($allConnections) {
            foreach ($conn in $allConnections) {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                Write-Host "   Port $port used by: $($process.ProcessName) (PID: $($conn.OwningProcess), State: $($conn.State))" -ForegroundColor Blue
            }
        }
    } catch {
        # Ignore errors
    }
}

# Suggest solutions
Write-Host "`n🔧 Step 5: Recommended Actions" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow

if (-not (Get-NetTCPConnection -LocalPort 5105 -State Listen -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GameServer (port 5105) is not running!" -ForegroundColor Red
    Write-Host "   Solutions:" -ForegroundColor Yellow
    Write-Host "   1. Start your C#/.NET GameServer application" -ForegroundColor White
    Write-Host "   2. Check if the server crashed or stopped" -ForegroundColor White
    Write-Host "   3. Verify server configuration (appsettings.json)" -ForegroundColor White
    Write-Host "   4. Check server logs for errors" -ForegroundColor White
} else {
    Write-Host "✅ GameServer appears to be running" -ForegroundColor Green
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. If server is not running, start it first" -ForegroundColor White
Write-Host "2. If server is running, check server logs for errors" -ForegroundColor White
Write-Host "3. Try running this in browser console: serverDiagnostic.checkServerPorts()" -ForegroundColor White

Write-Host "`n📝 For detailed browser-based testing, run in browser console:" -ForegroundColor Green
Write-Host "serverDiagnostic.testServers()" -ForegroundColor White