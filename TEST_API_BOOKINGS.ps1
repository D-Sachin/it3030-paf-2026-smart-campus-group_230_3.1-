# Module B - Booking API Testing Script

$BASE_URL = "http://localhost:8080/api/bookings"
$TOKEN = "YOUR_JWT_TOKEN_HERE"

function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-ErrorLine { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Header { Write-Host "`n=== $args ===" -ForegroundColor Yellow }

$testsPassed = 0
$testsFailed = 0

function Invoke-BookingTest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [string]$Description,
        [int[]]$ExpectedStatus = @(200, 201)
    )

    Write-Info "Testing: $Description"
    try {
        $headers = @{
            "Authorization" = "Bearer $TOKEN"
            "Content-Type" = "application/json"
        }

        $params = @{
            Uri = "$BASE_URL$Endpoint"
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
        }

        if ($null -ne $Body) {
            $params["Body"] = $Body | ConvertTo-Json -Depth 10
        }

        $response = Invoke-RestMethod @params
        Write-Success "✓ PASSED"
        $script:testsPassed++
        return $response
    } catch {
        Write-ErrorLine "✗ FAILED - $($_.Exception.Message)"
        $script:testsFailed++
        return $null
    }
}

Write-Header "MODULE B - BOOKING TESTS"

# 1. Create booking request
$createPayload = @{
    resourceId = 1
    bookingDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    startTime = "10:00"
    endTime = "11:00"
    purpose = "Student project discussion"
    expectedAttendees = 15
}
$created = Invoke-BookingTest -Method "POST" -Endpoint "" -Body $createPayload -Description "Create booking request"
$bookingId = $created.data.id

# 2. View my bookings
Invoke-BookingTest -Method "GET" -Endpoint "/my" -Body $null -Description "Get my bookings"

# 3. Admin pending queue
Invoke-BookingTest -Method "GET" -Endpoint "/admin?status=PENDING" -Body $null -Description "Get pending bookings as admin"

# 4. Approve booking (admin)
if ($bookingId) {
    $approvePayload = @{ reason = "Approved for academic session" }
    Invoke-BookingTest -Method "PUT" -Endpoint "/$bookingId/approve" -Body $approvePayload -Description "Approve booking"
}

# 5. Cancel approved booking (owner)
if ($bookingId) {
    Invoke-BookingTest -Method "PUT" -Endpoint "/$bookingId/cancel" -Body $null -Description "Cancel approved booking"
}

Write-Host "`n=== BOOKING TEST SUMMARY ===" -ForegroundColor Cyan
Write-Success "Passed: $testsPassed"
Write-ErrorLine "Failed: $testsFailed"
Write-Info "Total: $($testsPassed + $testsFailed)"
Write-Info "Set TOKEN before running: .\TEST_API_BOOKINGS.ps1"
