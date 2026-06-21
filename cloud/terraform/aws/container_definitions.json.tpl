[
  {
    "name": "cm-mongo",
    "image": "mongo:8.0-noble",
    "essential": true,
    "mountPoints": [
      {
        "sourceVolume": "mongodb-data",
        "containerPath": "/data/db",
        "readOnly": false
      }
    ],
    "secrets": [
      {
        "name": "MONGO_INITDB_ROOT_USERNAME",
        "valueFrom": "${mongo_secret_arn}:username::"
      },
      {
        "name": "MONGO_INITDB_ROOT_PASSWORD",
        "valueFrom": "${mongo_secret_arn}:password::"
      }
    ],
    "healthCheck": {
      "command": [
        "CMD",
        "mongosh",
        "--eval",
        "db.adminCommand('ping')"
      ],
      "interval": 30,
      "timeout": 10,
      "retries": 5,
      "startPeriod": 60
    },
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${log_group}",
        "awslogs-region": "${aws_region}",
        "awslogs-stream-prefix": "cm-mongo"
      }
    }
  },
  {
    "name": "cm-api",
    "image": "${api_image}",
    "essential": true,
    "portMappings": [
      {
        "containerPort": 3000,
        "protocol": "tcp",
        "hostPort": 3000
      }
    ],
    "environment": [
      { "name": "NODE_ENV", "value": "${api_mode}" },
      { "name": "PORT", "value": "3000" }
    ],
    "secrets": [
      {
        "name": "MONGO_USERNAME",
        "valueFrom": "${mongo_secret_arn}:username::"
      },
      {
        "name": "MONGO_PASSWORD",
        "valueFrom": "${mongo_secret_arn}:password::"
      }
    ],
    "healthCheck": {
      "command": [
        "CMD-SHELL",
        "curl -f http://localhost:3000/health || exit 1"
      ],
      "interval": 30,
      "timeout": 10,
      "retries": 3,
      "startPeriod": 60
    },
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${log_group}",
        "awslogs-region": "${aws_region}",
        "awslogs-stream-prefix": "cm-api"
      }
    },
    "dependsOn": [
      {
        "containerName": "cm-mongo",
        "condition": "HEALTHY"
      }
    ]
  }
]
