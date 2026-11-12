# Using django

## Contents

- [Contents](#contents)
- [Use django admin](#use-django-admin)
  - [Create project](#create-project)
- [Manage migrations](#manage-migrations)

## Use django admin

```bash
django-admin --version
>> 6.1
```

### Create project

From your shell, run the following command to create a new Django project
replacing the `{{ project_name }}` and `{{ version }}` sections. 

```bash
django-admin startproject {{ project_name }} --template https://github.com/mongodb-labs/django-mongodb-project/archive/refs/heads/{{ version }}.x.zip
```

For a project named `6_1_example` that runs on `django==6.1.*`
the command would look like this:

```bash
django-admin startproject 6_1_example --template https://github.com/mongodb-labs/django-mongodb-project/archive/refs/heads/6.1.x.zip
```

## Manage migrations

Run Django commands inside the container (`make interactive`), from `/app/src`:

To create a new migration, run the following command, replacing `{{ app_name }}` with the name of your app:

```bash
cd src && python manage.py makemigrations {{ app_name }}
```

For an app named `myapp`, the command would look like this:

```bash
cd src && python manage.py makemigrations myapp
```
