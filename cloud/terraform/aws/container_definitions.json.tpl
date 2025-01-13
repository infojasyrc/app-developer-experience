[
  {
    "name": "${container_name}_api",
    "image": "${api_image}",
    "workingDirectory": "${api_entrypoint_folder}",
    "command": ["/bin/bash","-ci","flask run -h 0.0.0.0 -p 4000"],
    "environment" : [
      { "name" : "FLASK_ENV", "value" : "${flask_mode}" },
      { "name" : "APP_DB_URL", "value" : "${db_url}" },
      { "name" : "APP_DB", "value" : "${db_name}" }
    ],
    "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${log_group}",
          "awslogs-region": "${aws_region}",
          "awslogs-stream-prefix": "${container_name}_api"
        }
    },
    "portMappings": [
      {
        "containerPort": 4000,
        "protocol": "tcp",
        "hostPort": 4000
      }
    ]
  },
  {
    "name": "${container_name}_ui",
    "image": "${ui_image}",
    "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${log_group}",
          "awslogs-region": "${aws_region}",
          "awslogs-stream-prefix": "${container_name}_ui"
        }
    },
    "portMappings": [
      {
        "containerPort": 80,
        "protocol": "tcp",
        "hostPort": 80
      }
    ],
    "dependsOn": [
      {
        "containerName": "${container_name}_api",
        "condition": "START"
      }
    ]
  },
  {
      "name": "db_migration",
      "image": "${api_image}",
      "essential": false,
      "workingDirectory": "${migration_entrypoint_folder}",
      "command": ["/bin/bash","-ci","python ./database_migration.py;"],
      "environment" : [
          { "name": "APP_DB_URL", "value": "${db_url}" },
          { "name": "APP_DB", "value": "${db_name}" }
      ],
      "logConfiguration": {
          "logDriver": "awslogs",
          "options": {
            "awslogs-group": "${log_group}",
            "awslogs-region": "${aws_region}",
            "awslogs-stream-prefix": "db_migration"
          }
      }
  }
]
