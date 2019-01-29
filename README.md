# CMPT432N-PythonCompiler
Design Of Compilers - Marist College - Dr. Labouseur

The scope of this project is to create a compiler from scratch and is broken up into four phases. Each phase will make up a branch in this repository along with the relevant Lab work.

# Setting up Python, Django, and a Development Environment
There are several supported versions of Python available for use. This project uses Python version 3.7.1. If you do not already have this version of Python installed, visit https://www.python.org/downloads/ and navigate to the download link for Python 3.7.1. When running the Python installer be sure to check the box labeled 'Add Python 3.7.1 to PATH'.

If you already have Python installed, you can check the version by opening a command line window and typing:
- `python --version`

Within this project, I have already created the necessary virtual environment for testing and development. When in the root directory of the project, execute this command to enter this virtual environment:
- `environment\Scripts\activate`

Each command line should now appear with `(environment)` at the beginning of it, meaning everything installed correctly and you are currently in the virtual environment. 
To deactivate the virtual environment at any time, execute the command:
- `environment\Scripts\deactivate.bat` 

Now, install Django. Django is a popular web framework written in Python, and while we don't need to utilize it's authentication or database abilities, it does provide us with a convenient webserver for development and testing. This project uses Django's latest version (currently 2.1.5). While the virtual environment is activated, execute the following command to install:
- `pip install django` 

Django is installed with many tools, among them is the utility django-admin which allows developers to run a local webserver for testing and development of their projects. In addition, a shortcut for django-admin is also created with any new Django project, this shortcut is the 'manage.py' file. Because this project's directory already exists, you just need to navigate to the directory 'compilerProject' while the compilers virtual environment is activated, and execute the command:
- `python manage.py runserver`

Open the given URL in a web browser and you can view the project. To stop the server, execute:
- `CTRL + C`

When creating an app using Django, it creates a file structure in which the app can be found within a lower level directory, in our case, the initial 'compilerProject' directory. This app is named 'pythonCompiler'.

# Styling
I style my components using Bootstrap 4. Bootstrap is a popular open-source front-end framework that contains HTML and CSS design templates.

# Development

I use a text editor for development of this project, most of them work fine however I do not recommend using an editor's built in console, I use my system's command line.
