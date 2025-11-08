$ts = [int][double]::Parse((Get-Date -UFormat %s))
$email = "teststudent+$ts@example.com"
$body = @{
  userId = "S$ts"
  name = "Auto Test"
  email = $email
  password = "Password123!"
  role = "student"
  department = "CSE"
  semester = 4
  section = "A"
} | ConvertTo-Json

Write-Output '--- REGISTER ATTEMPT ---'
try {
  $reg = Invoke-RestMethod -Uri http://localhost:5000/api/users/register -Method POST -Body $body -ContentType 'application/json' -ErrorAction Stop
  Write-Output ("REGISTER SUCCESS: " + ($reg | ConvertTo-Json))
} catch {
  try { $code = $_.Exception.Response.StatusCode.Value__ } catch { $code = 'N/A' }
  Write-Output ("REGISTER FAILED: " + $code + ' ' + $_.Exception.Message)
}

Write-Output '--- LOGIN ATTEMPT ---'
$loginBody = @{ email = $email; password = 'Password123!' } | ConvertTo-Json
try {
  $login = Invoke-RestMethod -Uri http://localhost:5000/api/users/login -Method POST -Body $loginBody -ContentType 'application/json' -ErrorAction Stop
  Write-Output ("LOGIN SUCCESS: " + ($login | ConvertTo-Json))
  $token = $login.token
  Write-Output ("TOKEN: $token")
  Write-Output '--- TIMETABLE CALL ---'
  $headers = @{ Authorization = "Bearer $token" }
  try {
    $tt = Invoke-RestMethod -Uri http://localhost:5000/api/timetable/my -Method GET -Headers $headers -ErrorAction Stop
    Write-Output ("TIMETABLE: " + ($tt | ConvertTo-Json))
  } catch {
    Write-Output ("TIMETABLE CALL FAILED: " + $_.Exception.Message)
  }
} catch {
  Write-Output ("LOGIN FAILED: " + $_.Exception.Message)
}
