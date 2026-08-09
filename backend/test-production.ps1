$baseUrl = "https://cargox.onrender.com"
$passed = 0
$failed = 0

function Run-Test {
    param(
        [string]$Name,
        [scriptblock]$TestBlock
    )

    Write-Host "Running: $Name"

    try {
        &$TestBlock

        Write-Host "[PASS] $Name`n" -ForegroundColor Green
        $script:passed++
    }
    catch {
        Write-Host "[FAIL] $Name" -ForegroundColor Red

        if ($_.Exception.Response) {
            Write-Host "STATUS:" $_.Exception.Response.StatusCode.value__ -ForegroundColor Red

            $reader = New-Object System.IO.StreamReader(
                $_.Exception.Response.GetResponseStream()
            )

            Write-Host "RESPONSE:" -ForegroundColor Red
            Write-Host $reader.ReadToEnd() -ForegroundColor Red
        }
        else {
            Write-Host "ERROR:" $_.Exception.Message -ForegroundColor Red
        }

        Write-Host ""
        $script:failed++
    }
}


# ============================================================
# 1. HEALTH CHECK
# ============================================================

Run-Test "Health Check" {

    $r = Invoke-RestMethod `
        -Uri "$baseUrl/health" `
        -Method GET

    if ($r.status -ne "healthy") {
        throw "API is not healthy"
    }
}


# ============================================================
# 2. REGISTER TEST CUSTOMER
# ============================================================

$timestamp = Get-Date -Format "yyyyMMddHHmmss"

$email = "test_$timestamp@test.com"

Run-Test "Register Customer" {

    $body = @{
        email    = $email
        password = "password123"
        full_name = "Test User"
        role     = "Customer"
    } | ConvertTo-Json

    $r = Invoke-RestMethod `
        -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
}


# ============================================================
# 3. LOGIN CUSTOMER
# ============================================================

Run-Test "Login Customer" {

    $body = @{
        email    = $email
        password = "password123"
    } | ConvertTo-Json

    $r = Invoke-RestMethod `
        -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    if (-not $r.access_token) {
        throw "Customer JWT was not returned"
    }

    $global:token = $r.access_token
}


# ============================================================
# 4. GET CUSTOMER PROFILE
# ============================================================

Run-Test "Get Profile" {

    $r = Invoke-RestMethod `
        -Uri "$baseUrl/api/auth/profile" `
        -Method GET `
        -Headers @{
            Authorization = "Bearer $global:token"
        }
}


# ============================================================
# 5. UPDATE CUSTOMER PROFILE
# ============================================================

Run-Test "Update Profile" {

    $body = @{
        company_name = "Test Corp"
    } | ConvertTo-Json

    $r = Invoke-RestMethod `
        -Uri "$baseUrl/api/users/profile" `
        -Method PUT `
        -ContentType "application/json" `
        -Headers @{
            Authorization = "Bearer $global:token"
        } `
        -Body $body
}


# ============================================================
# 6. CREATE SHIPMENT
# ============================================================

Run-Test "Create Shipment" {

    $body = @{
        pickup_address  = "A"
        dropoff_address = "B"
    } | ConvertTo-Json

    $r = Invoke-RestMethod `
        -Uri "$baseUrl/api/shipments/" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{
            Authorization = "Bearer $global:token"
        } `
        -Body $body

    if (-not $r.id) {
        throw "Shipment ID was not returned"
    }

    $global:shipId = $r.id
}


# ============================================================
# 7. LIST SHIPMENTS
# ============================================================

Run-Test "List Shipments" {

    $r = Invoke-RestMethod `
        -Uri "$baseUrl/api/shipments/" `
        -Method GET `
        -Headers @{
            Authorization = "Bearer $global:token"
        }
}


# ============================================================
# 8. GET SHIPMENT TRACKING
# ============================================================

Run-Test "Get Tracking" {

    $r = Invoke-RestMethod `
        -Uri "$baseUrl/api/shipments/$global:shipId/tracking" `
        -Method GET `
        -Headers @{
            Authorization = "Bearer $global:token"
        }
}


# ============================================================
# 9. REGISTER + LOGIN TRUCK OWNER
# ============================================================

Run-Test "TruckOwner Cannot Create Shipment" {

    $email2 = "truck_$timestamp@test.com"

    # Register TruckOwner
    $body = @{
        email     = $email2
        password  = "password123"
        full_name = "Truck Guy"
        role      = "TruckOwner"
    } | ConvertTo-Json

    Invoke-RestMethod `
        -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body


    # Login TruckOwner
    $bodyLogin = @{
        email    = $email2
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod `
        -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $bodyLogin


    # IMPORTANT:
    # Use GLOBAL scope so later tests can use this token
    if (-not $loginResponse.access_token) {
        throw "TruckOwner JWT was not returned"
    }

    $global:truckToken = $loginResponse.access_token


    # Try creating shipment with TruckOwner
    try {

        $bodyShip = @{
            pickup_address  = "A"
            dropoff_address = "B"
        } | ConvertTo-Json

        Invoke-RestMethod `
            -Uri "$baseUrl/api/shipments/" `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{
                Authorization = "Bearer $global:truckToken"
            } `
            -Body $bodyShip

        throw "TruckOwner was incorrectly allowed to create shipment"

    }
    catch {

        if ($_.Exception.Response.StatusCode.value__ -ne 403) {
            throw "Expected 403 Forbidden but received $($_.Exception.Response.StatusCode.value__)"
        }
    }
}


# ============================================================
# 10. INVALID JWT
# ============================================================

Run-Test "Invalid JWT" {

    try {

        Invoke-RestMethod `
            -Uri "$baseUrl/api/shipments/" `
            -Method GET `
            -Headers @{
                Authorization = "Bearer invalid"
            }

        throw "Invalid JWT was accepted"

    }
    catch {

        if ($_.Exception.Response.StatusCode.value__ -notin @(401, 422)) {
            throw "Expected 401 or 422"
        }
    }
}


# ============================================================
# 11. MISSING REQUIRED FIELDS
# ============================================================

Run-Test "Missing Required Fields" {

    try {

        $body = @{
            pickup_address = "A"
        } | ConvertTo-Json

        Invoke-RestMethod `
            -Uri "$baseUrl/api/shipments/" `
            -Method POST `
            -ContentType "application/json" `
            -Headers @{
                Authorization = "Bearer $global:token"
            } `
            -Body $body

        throw "Request should have failed"

    }
    catch {

        if ($_.Exception.Response.StatusCode.value__ -ne 400) {
            throw "Expected 400 Bad Request"
        }
    }
}


# ============================================================
# 12. DUPLICATE EMAIL
# ============================================================

Run-Test "Duplicate Email" {

    try {

        $body = @{
            email     = $email
            password  = "password123"
            full_name = "Test User"
            role      = "Customer"
        } | ConvertTo-Json

        Invoke-RestMethod `
            -Uri "$baseUrl/api/auth/register" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body

        throw "Duplicate email was incorrectly accepted"

    }
    catch {

        if ($_.Exception.Response.StatusCode.value__ -ne 409) {
            throw "Expected 409 Conflict"
        }
    }
}


# ============================================================
# 13. TRUCK API
# ============================================================

Run-Test "Truck API" {

    # Make absolutely sure token exists
    if (-not $global:truckToken) {
        throw "TruckOwner token is empty"
    }

    $truckBody = @{
        registration_number = "TRK-$timestamp"
        capacity_tons       = 10
        truck_type          = "Open"
    } | ConvertTo-Json

    $r = Invoke-RestMethod `
        -Uri "$baseUrl/api/trucks/" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{
            Authorization = "Bearer $global:truckToken"
        } `
        -Body $truckBody

    if (-not $r) {
        throw "Truck API returned empty response"
    }
}


# ============================================================
# 14. SHIPMENT AUTHORIZATION
# ============================================================

Run-Test "Shipment Authorization (TruckOwner sees own)" {

    if (-not $global:truckToken) {
        throw "TruckOwner token is empty"
    }

    $r = Invoke-RestMethod `
        -Uri "$baseUrl/api/shipments/" `
        -Method GET `
        -Headers @{
            Authorization = "Bearer $global:truckToken"
        }

    if ($null -eq $r) {
        throw "Shipment authorization returned no response"
    }
}


# ============================================================
# 15. CHAT ENDPOINT
# ============================================================

Run-Test "Chat REST Endpoint" {

    $r = Invoke-RestMethod `
        -Uri "$baseUrl/api/chat/shipment/$global:shipId" `
        -Method GET `
        -Headers @{
            Authorization = "Bearer $global:token"
        }

    if ($null -eq $r) {
        throw "Chat endpoint returned no response"
    }
}


# ============================================================
# FINAL SUMMARY
# ============================================================

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "CARGOX PRODUCTION TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Write-Host "Passed: $passed"
Write-Host "Failed: $failed"

if ($failed -eq 0) {

    Write-Host ""
    Write-Host "STATUS: READY FOR DEPLOYMENT" -ForegroundColor Green

}
else {

    Write-Host ""
    Write-Host "STATUS: NOT READY" -ForegroundColor Red
}