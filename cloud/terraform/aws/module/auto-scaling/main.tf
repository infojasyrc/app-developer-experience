# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# Auto Scale
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

resource "aws_appautoscaling_target" "app_target" {
  max_capacity       = var.max_capacity
  min_capacity       = var.min_capacity
  resource_id        = "service/${var.cluster_name}/${var.ecs_service_name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "app_to_memory" {
  name               = "${var.application_name}-memory-policy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.app_target.resource_id
  scalable_dimension = aws_appautoscaling_target.app_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.app_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }

    target_value = var.target_for_memory
  }
}

resource "aws_appautoscaling_policy" "app_to_cpu" {
  name               = "${var.application_name}-cpu-policy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.app_target.resource_id
  scalable_dimension = aws_appautoscaling_target.app_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.app_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value = var.target_for_cpu
  }
}
