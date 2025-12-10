#!/usr/bin/env pwsh
# Test script for rate limiting functionality
# Run this after starting the dev server with: npm run dev

Write-Host "🧪 Testing TradeX Rate Limiting..." -ForegroundColor Cyan
Write-Host ""

$loginUrl = "http://localhost:3000/api/login"
$testEmail = "test@example.com"
$testPassword = "wrongpassword"

Write-Host "Testing 7 consecutive login attempts..." -ForegroundColor Yellow
Write-Host "Expected: First 5 should return 401, attempts 6-7 should return 429" -ForegroundColor Gray
Write-Host ""

for ($i = 1; $i -le 7; $i++) {
    Write-Host "Attempt $i..." -NoNewline
    
    $body = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri $loginUrl `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -SkipHttpErrorCheck

        $statusCode = $response.StatusCode
        $content = $response.Content | ConvertFrom-Json

        if ($statusCode -eq 401) {
            Write-Host " ✅ Status: 401 (Unauthorized)" -ForegroundColor Green
        } elseif ($statusCode -eq 429) {
            Write-Host " ✅ Status: 429 (Rate Limited)" -ForegroundColor Yellow
            Write-Host "   Message: $($content.error)" -ForegroundColor Gray
            
            # Check for rate limit headers
            $retryAfter = $response.Headers['Retry-After']
            if ($retryAfter) {
                Write-Host "   Retry-After: $retryAfter seconds" -ForegroundColor Gray
            }
        } else {
            Write-Host " ❌ Unexpected status: $statusCode" -ForegroundColor Red
            Write-Host "   Response: $($content | ConvertTo-Json -Compress)" -ForegroundColor Gray
        }
    } catch {
        Write-Host " ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }

    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "✅ Test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Expected results:" -ForegroundColor Cyan
Write-Host "  - Attempts 1-5: Status 401 (Unauthorized)" -ForegroundColor Gray
Write-Host "  - Attempts 6-7: Status 429 (Too Many Requests)" -ForegroundColor Gray
Write-Host ""
Write-Host "If you see 429 on attempts 6-7, rate limiting is working correctly! 🎉" -ForegroundColor Green
