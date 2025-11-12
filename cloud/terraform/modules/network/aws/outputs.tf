output "vpc_id" {
  value = aws_vpc.main.id
}

output "private_subnets" {
  description = "list of all private subnets"
  value       = aws_subnet.private.*.id
}

output "public_subnets" {
  description = "list of all public subnets"
  value       = aws_subnet.public.*.id
}
