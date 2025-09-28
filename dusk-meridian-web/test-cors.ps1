# PowerShell script to test CORS configuration
# Run this in PowerShell: .\test-cors.ps1

Write-Host "🔍 Testing Server CORS Configuration" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Test 1: Health endpoint (should work)
Write-Host "`n📡 Testing Health Endpoint:" -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5105/health" -Method GET -Headers @{"Origin"="http://localhost:8080"} -UseBasicParsing
    Write-Host "   ✅ Status: $($healthResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   🔍 CORS Headers:" -ForegroundColor Blue

    $corsHeaders = @(
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Credentials",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Headers"
    )

    foreach ($header in $corsHeaders) {
        $value = $healthResponse.Headers[$header]
        if ($value) {
            Write-Host "      $header : $value" -ForegroundColor Green
        } else {
            Write-Host "      $header : [MISSING]" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ❌ Health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Character endpoint (the problematic one)
Write-Host "`n📡 Testing Character Endpoint:" -ForegroundColor Yellow
try {
    $charResponse = Invoke-WebRequest -Uri "http://localhost:5105/api/character/my-characters" -Method GET -Headers @{"Origin"="http://localhost:8080"} -UseBasicParsing
    Write-Host "   ✅ Status: $($charResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   🔍 CORS Headers:" -ForegroundColor Blue

    foreach ($header in $corsHeaders) {
        $value = $charResponse.Headers[$header]
        if ($value) {
            Write-Host "      $header : $value" -ForegroundColor Green
        } else {
            Write-Host "      $header : [MISSING]" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ❌ Character endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   📋 This is expected - endpoint returns 500 and missing CORS headers" -ForegroundColor Yellow
}

# Test 3: OPTIONS preflight request
Write-Host "`n📡 Testing OPTIONS Preflight:" -ForegroundColor Yellow
try {
    $optionsResponse = Invoke-WebRequest -Uri "http://localhost:5105/api/character/my-characters" -Method OPTIONS -Headers @{
        "Origin"="http://localhost:8080"
        "Access-Control-Request-Method"="GET"
        "Access-Control-Request-Headers"="authorization,content-type"
    } -UseBasicParsing

    Write-Host "   ✅ OPTIONS Status: $($optionsResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   🔍 Preflight CORS Headers:" -ForegroundColor Blue

    foreach ($header in $corsHeaders) {
        $value = $optionsResponse.Headers[$header]
        if ($value) {
            Write-Host "      $header : $value" -ForegroundColor Green
        } else {
            Write-Host "      $header : [MISSING]" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ❌ OPTIONS request failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Summary:" -ForegroundColor Cyan
Write-Host "============" -ForegroundColor Cyan
Write-Host "If you see missing CORS headers for the character endpoint," -ForegroundColor Yellow
Write-Host "the backend server needs CORS configuration for /api/* routes." -ForegroundColor Yellow
Write-Host "`nRun this in your browser console for detailed testing:" -ForegroundColor Green
Write-Host "serverDiagnostic.testServers()" -ForegroundColor White