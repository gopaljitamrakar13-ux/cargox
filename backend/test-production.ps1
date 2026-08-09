$baseUrl = "https://cargox.onrender.com"
$passed = 0
$failed = 0

function Run-Test {
    param([string]$Name, [scriptblock]$TestBlock)
    Write-Host "Running: $Name"
    try {
        &$TestBlock
        Write-Host "[PASS] $Name`n" -ForegroundColor Green
        $script:passed++
    } catch {
        Write-Host "[FAIL] $Name" -ForegroundColor Red
        Write-Host "STATUS:" $_.Exception.Response.StatusCode.value__ -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "RESPONSE:" $reader.ReadToEnd() -ForegroundColor Red
        }
        Write-Host ""
        $script:failed++
    }
}

# 1. Test health
Run-Test "Health Check" {
    $r = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    if ($r.status -ne "healthy") { throw "Not healthy" }
}

# 2. Register test customer
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$email = "test_$timestamp@test.com"
Run-Test "Register Customer" {
    $body = @{ email = $email; password = "password123"; full_name = "Test User"; role = "Customer" } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -ContentType "application/json" -Body $body
}

# 3. Login customer
Run-Test "Login Customer" {
    $body = @{ email = $email; password = "password123" } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $body
    $global:token = $r.access_token
}

# 4. Get customer profile
Run-Test "Get Profile" {
    $r = Invoke-RestMethod -Uri "$baseUrl/api/auth/profile" -Method GET -Headers @{ Authorization = "Bearer $token" }
}

# 5. Update customer profile
Run-Test "Update Profile" {
    $body = @{ company_name = "Test Corp" } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$baseUrl/api/users/profile" -Method PUT -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" } -Body $body
}

# 6. Create shipment
Run-Test "Create Shipment" {
    $body = @{ pickup_address = "A"; dropoff_address = "B" } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$baseUrl/api/shipments/" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" } -Body $body
    $global:shipId = $r.id
}

# 7. List shipments
Run-Test "List Shipments" {
    $r = Invoke-RestMethod -Uri "$baseUrl/api/shipments/" -Method GET -Headers @{ Authorization = "Bearer $token" }
}

# 8. Get shipment tracking
Run-Test "Get Tracking" {
    $r = Invoke-RestMethod -Uri "$baseUrl/api/shipments/$shipId/tracking" -Method GET -Headers @{ Authorization = "Bearer $token" }
}

# 9. Test unauthorized shipment creation using TruckOwner
Run-Test "TruckOwner Cannot Create Shipment" {
    # Generate truck owner
    $email2 = "truck_$timestamp@test.com"
    $body = @{ email = $email2; password = "password123"; full_name = "Truck Guy"; role = "TruckOwner" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -ContentType "application/json" -Body $body
    $bodyLogin = @{ email = $email2; password = "password123" } | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $bodyLogin
    $truckToken = $loginResponse.access_token

    # Try creating shipment
    try {
        $bodyShip = @{ pickup_address = "A"; dropoff_address = "B" } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/api/shipments/" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $truckToken" } -Body $bodyShip
        throw "Should have failed"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 403) { throw "Expected 403 Forbidden" }
    }
}

# 10. Test invalid JWT
Run-Test "Invalid JWT" {
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/shipments/" -Method GET -Headers @{ Authorization = "Bearer invalid" }
        throw "Should have failed"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -notin @(401, 422)) { throw "Expected 401/422" }
    }
}

# 11. Test missing required fields
Run-Test "Missing Required Fields" {
    try {
        $body = @{ pickup_address = "A" } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/api/shipments/" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" } -Body $body
        throw "Should have failed"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 400) { throw "Expected 400" }
    }
}

# 12. Test duplicate email
Run-Test "Duplicate Email" {
    try {
        $body = @{ email = $email; password = "password123"; full_name = "Test User"; role = "Customer" } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -ContentType "application/json" -Body $body
        throw "Should have failed"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 409) { throw "Expected 409" }
    }
}

# 13. Test truck API with TruckOwner
Run-Test "Truck API" {
    # Using the TruckOwner token from step 9
    $truckBody = @{ registration_number = "TRK-$timestamp"; capacity_tons = 10 } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/trucks/" -Method POST -ContentType "application/json" -Headers @{ Authorization = "Bearer $truckToken" } -Body $truckBody
}

# 14. Test shipment authorization
Run-Test "Shipment Authorization (TruckOwner sees own)" {
    Invoke-RestMethod -Uri "$baseUrl/api/shipments/" -Method GET -Headers @{ Authorization = "Bearer $truckToken" }
}

# 15. Test chat endpoint
Run-Test "Chat REST Endpoint" {
    Invoke-RestMethod -Uri "$baseUrl/api/chat/shipment/$shipId" -Method GET -Headers @{ Authorization = "Bearer $token" }
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "CARGOX PRODUCTION TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Passed: $passed"
Write-Host "Failed: $failed"
if ($failed -eq 0) {
    Write-Host "Status: READY" -ForegroundColor Green
} else {
    Write-Host "Status: NOT READY" -ForegroundColor Red
}
