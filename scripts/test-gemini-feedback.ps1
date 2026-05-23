$body = @{
  question = @{
    id = "test"
    level = "IM2"
    type = "experience"
    topic = "travel"
    surveyTags = @("travel")
    prompt = "Tell me about a memorable trip you took recently."
    difficulty = 2
    prepTimeSec = 30
    answerTimeSec = 90
    evaluationFocus = @("past experience", "specific details")
    sampleAnswer = ""
    usefulExpressions = @("Last winter, I went to...")
  }
  transcript = "Last winter, I went to Busan with my friends. It was memorable because we found a small restaurant and had great seafood."
  targetLevel = "IM2"
  answerSeconds = 90
} | ConvertTo-Json -Depth 10

$port = if ($args.Length -gt 0) { $args[0] } else { "3000" }

$result = Invoke-RestMethod `
  -Uri "http://127.0.0.1:$port/api/feedback" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body `
  -ErrorAction Stop

Write-Output "provider=$($result.provider)"
Write-Output "summary=$($result.feedback.summaryKo)"
