# Using django

```bash
django-admin --version
>> 5.0
```

## Create the Django project

From your shell, run the following command to create a new Django project
replacing the `{{ project_name }}` and `{{ version }}` sections. 

```bash
django-admin startproject {{ project_name }} --template https://github.com/mongodb-labs/django-mongodb-project/archive/refs/heads/{{ version }}.x.zip
```

For a project named `5_0_example` that runs on `django==5.0.*`
the command would look like this:

```bash
django-admin startproject 5_0_example --template https://github.com/mongodb-labs/django-mongodb-project/archive/refs/heads/5.0.x.zip
```
