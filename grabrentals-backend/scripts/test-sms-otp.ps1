<#
.SYNOPSIS
    Test script for WeFormSolution SMS OTP Gateway (Grab Rentals)

.DESCRIPTION
    Sends a test OTP SMS using the WeFormSolution API with DLT-approved template.

.PARAMETER Phone
    The 10-digit mobile number to send the OTP to (e.g., 9345004690).

.PARAMETER Otp
    Optional custom 6-digit OTP. If omitted, a random 6-digit OTP will be generated.

.EXAMPLE
    .\test-sms-otp.ps1 -Phone 9345004690
    .\test-sms-otp.ps1 -Phone 9790416823 -Otp 123456
#>

[CmdletBinding()]
param (
    [Parameter(Position = 0, Mandatory = $false)]
    [string]$Phone,

    [Parameter(Position = 1, Mandatory = $false)]
    [string]$Otp
)

# 1. API Configuration
$ApiUrl = "https://portal.weformsolution.com/sms/api/send-campaign"
$ApiKey = "sYAcUA9UFjzDFnm1qgEiD6uamY3XJf3mSSIzdPuU3_s"
$SenderId = "GRABRE"
$TemplateId = "1777179377548103665"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "     Grab Rentals - WeFormSolution SMS OTP Tester         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 2. Prompt for Phone if not provided
if ([string]::IsNullOrWhiteSpace($Phone)) {
    $Phone = Read-Host "Enter recipient 10-digit mobile number (e.g. 9345004690)"
}

# Clean phone number: extract last 10 digits
$CleanPhone = $Phone -replace "[^0-9]", ""
if ($CleanPhone.Length -gt 10) {
    $CleanPhone = $CleanPhone.Substring($CleanPhone.Length - 10)
}

if ($CleanPhone.Length -ne 10) {
    Write-Host "[ERROR] Invalid phone number '$Phone'. Must contain 10 digits." -ForegroundColor Red
    exit 1
}

# 3. Generate or use provided OTP
if ([string]::IsNullOrWhiteSpace($Otp)) {
    $Random = New-Object System.Random
    $Otp = $Random.Next(100000, 999999).ToString()
}

# 4. Construct DLT-Approved Message
$MessageText = "Hi, Welcome to GranRentals, The best cab rental service platform in India. Your One Time Password for Login is $Otp For more details, log onto www.grabrentals.in"

Write-Host "`nTarget Phone : " -NoNewline; Write-Host $CleanPhone -ForegroundColor Yellow
Write-Host "Generated OTP: " -NoNewline; Write-Host $Otp -ForegroundColor Green
Write-Host "Sender ID    : " -NoNewline; Write-Host $SenderId -ForegroundColor Yellow
Write-Host "Template ID  : " -NoNewline; Write-Host $TemplateId -ForegroundColor Yellow
Write-Host "Endpoint     : " -NoNewline; Write-Host $ApiUrl -ForegroundColor Gray
Write-Host "Message Text : " -NoNewline; Write-Host "`"$MessageText`"" -ForegroundColor DarkGray
Write-Host "`nSending SMS request to WeFormSolution gateway..." -ForegroundColor Cyan

# 5. Build Payload
$Payload = @{
    campaign_name = "API TEST"
    sender_id     = $SenderId
    template_id   = $TemplateId
    dcs           = 0
    messages      = @(
        @{
            mobile  = $CleanPhone
            message = $MessageText
        }
    )
} | ConvertTo-Json -Depth 5

$Headers = @{
    "X-API-Key"    = $ApiKey
    "Content-Type" = "application/json"
}

# 6. Dispatch Request
try {
    $Stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $Response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Headers $Headers -Body $Payload
    $Stopwatch.Stop()

    Write-Host "`n----------------- GATEWAY RESPONSE -----------------" -ForegroundColor Green
    Write-Host ($Response | ConvertTo-Json -Depth 5) -ForegroundColor Green
    Write-Host "----------------------------------------------------" -ForegroundColor Green
    Write-Host "Response Time: $($Stopwatch.ElapsedMilliseconds) ms" -ForegroundColor Gray

    if ($Response.code -eq "000") {
        Write-Host "`n[SUCCESS] Message submitted to gateway with Job ID: $($Response.jobId)" -ForegroundColor Green
        Write-Host "Check the handset ($CleanPhone) for the SMS containing OTP: $Otp" -ForegroundColor Yellow
        Write-Host "Note: If not received within 30s, check Spam & Blocked folder in Messages app." -ForegroundColor DarkYellow
    } else {
        Write-Host "`n[WARNING] Gateway returned non-000 code: $($Response.code)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n[FAILED] Request to SMS Gateway failed!" -ForegroundColor Red
    if ($_.Exception.Response) {
        $Stream = $_.Exception.Response.GetResponseStream()
        if ($Stream) {
            $Reader = New-Object System.IO.StreamReader($Stream)
            $ErrorBody = $Reader.ReadToEnd()
            Write-Host "HTTP Status: $([int]$_.Exception.Response.StatusCode)" -ForegroundColor Red
            Write-Host "Response Body: $ErrorBody" -ForegroundColor Red
        } else {
            Write-Host $_.Exception.Message -ForegroundColor Red
        }
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
