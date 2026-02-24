$stacks = aws cloudformation describe-stacks --query "Stacks[].StackName" --output text

$stackList = $stacks -split "`t"

foreach ($stack in $stackList) {
    if (-not [string]::IsNullOrWhiteSpace($stack)) {
        Write-Host "Processing Stack: $stack"        
        aws cloudformation update-termination-protection --no-enable-termination-protection --stack-name $stack
        aws cloudformation delete-stack --stack-name $stack
        Write-Host "Delete signal sent for: $stack"
    }
}
