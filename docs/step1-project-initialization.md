# Step 1: Project Initialization and Architecture Setup

## Objective
Establish the basic architecture for the Python learning website, select appropriate technology stack, and complete the initial project configuration.

## Detailed Tasks

### 1. Technology Stack Selection

According to the design proposal, we will use the following technology stack:

- **Backend Framework**: Django
- **Frontend Template**: Django Templates + Bootstrap 5
- **Online Editor**: CodeMirror
- **Database**: SQLite (development phase) / PostgreSQL (production environment)
- **Version Control**: Git

### 2. Environment Preparation

#### 2.1 Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Activate virtual environment (Linux/Mac)
source venv/bin/activate
```

#### 2.2 Install Basic Dependencies

```bash
pip install django==4.2.7
pip install django-crispy-forms
pip install crispy-bootstrap5
pip install django-ckeditor
pip install Pillow
pip install python-dotenv

# Save dependency list
pip freeze > requirements.txt
```

### 3. Project Initialization

#### 3.1 Create Django Project

```bash
django-admin startproject python_learning_platform .
```

#### 3.2 Create Applications

```bash
python manage.py startapp courses  # Course learning module
python manage.py startapp exercises  # Code practice module
python manage.py startapp editor  # Online editor module
python manage.py startapp accounts  # User accounts and learning progress module
```

### 4. Basic Configuration

#### 4.1 Configure settings.py

```python
# python_learning_platform/settings.py

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Security settings
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-default-key-for-development')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party applications
    'crispy_forms',
    'crispy_bootstrap5',
    'ckeditor',
    'ckeditor_uploader',
    
    # Custom applications
    'courses.apps.CoursesConfig',
    'exercises.apps.ExercisesConfig',
    'editor.apps.EditorConfig',
    'accounts.apps.AccountsConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'python_learning_platform.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'python_learning_platform.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Crispy Forms
CRISPY_ALLOWED_TEMPLATE_PACKS = 'bootstrap5'
CRISPY_TEMPLATE_PACK = 'bootstrap5'

# CKEditor
CKEDITOR_UPLOAD_PATH = 'uploads/'
CKEDITOR_RESTRICT_BY_USER = True
CKEDITOR_CONFIGS = {
    'default': {
        'toolbar': 'Custom',
        'toolbar_Custom': [
            ['Bold', 'Italic', 'Underline'],
            ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
            ['Link', 'Unlink'],
            ['RemoveFormat', 'Source']
        ],
        'height': 300,
        'width': '100%',
    },
}

# Authentication
LOGIN_REDIRECT_URL = 'home'
LOGOUT_REDIRECT_URL = 'home'
```

#### 4.2 Create .env File

Create a `.env` file in the project root:

```
SECRET_KEY=your_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### 4.3 Configure URLs

Update `python_learning_platform/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('accounts/', include('accounts.urls')),
    path('courses/', include('courses.urls')),
    path('exercises/', include('exercises.urls')),
    path('editor/', include('editor.urls')),
    path('ckeditor/', include('ckeditor_uploader.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
```

### 5. Create Basic Templates

#### 5.1 Create Base Template

Create `templates/base.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Python Learning Platform{% endblock %}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css">
    {% block extra_css %}{% endblock %}
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="{% url 'home' %}">Python Learning</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="{% url 'home' %}">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{% url 'courses:course_list' %}">Courses</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{% url 'exercises:exercise_list' %}">Exercises</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{% url 'editor:editor' %}">Code Editor</a>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    {% if user.is_authenticated %}
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                            {{ user.username }}
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="{% url 'accounts:profile' %}">My Profile</a></li>
                            <li><a class="dropdown-item" href="{% url 'accounts:progress' %}">My Progress</a></li>
                            <li><a class="dropdown-item" href="{% url 'accounts:notes' %}">My Notes</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="{% url 'logout' %}">Logout</a></li>
                        </ul>
                    </li>
                    {% else %}
                    <li class="nav-item">
                        <a class="nav-link" href="{% url 'login' %}">Login</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{% url 'accounts:register' %}">Register</a>
                    </li>
                    {% endif %}
                </ul>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="container mt-4 mb-5">
        {% if messages %}
            {% for message in messages %}
            <div class="alert alert-{{ message.tags }} alert-dismissible fade show">
                {{ message }}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            {% endfor %}
        {% endif %}
        
        {% block content %}{% endblock %}
    </div>

    <!-- Footer -->
    <footer class="bg-light py-4 mt-auto">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <p class="mb-0">© 2023 Python Learning Platform</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <a href="#" class="text-decoration-none">Terms of Service</a> | 
                    <a href="#" class="text-decoration-none">Privacy Policy</a>
                </div>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    {% block extra_js %}{% endblock %}
</body>
</html>
```

#### 5.2 Create Home Page Template

Create `templates/home.html`:

```html
{% extends 'base.html' %}

{% block title %}Home - Python Learning Platform{% endblock %}

{% block content %}
<div class="row align-items-center py-5">
    <div class="col-md-6">
        <h1 class="display-4 fw-bold">Learn Python Programming</h1>
        <p class="lead">Master Python with our comprehensive learning platform featuring interactive courses, coding exercises, and real-time code execution.</p>
        <div class="d-grid gap-2 d-md-flex justify-content-md-start">
            <a href="{% url 'courses:course_list' %}" class="btn btn-primary btn-lg px-4 me-md-2">Start Learning</a>
            <a href="{% url 'accounts:register' %}" class="btn btn-outline-secondary btn-lg px-4">Sign Up</a>
        </div>
    </div>
    <div class="col-md-6">
        <img src="/static/images/python-hero.svg" class="img-fluid" alt="Python Programming">
    </div>
</div>

<hr class="my-5">

<div class="row g-4 py-5">
    <div class="col-md-4">
        <div class="card h-100">
            <div class="card-body">
                <h3 class="card-title"><i class="bi bi-book text-primary me-2"></i>Structured Courses</h3>
                <p class="card-text">Learn Python from basics to advanced topics with our well-structured courses, complete with examples and quizzes.</p>
                <a href="{% url 'courses:course_list' %}" class="btn btn-sm btn-outline-primary">Browse Courses</a>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card h-100">
            <div class="card-body">
                <h3 class="card-title"><i class="bi bi-code-square text-primary me-2"></i>Coding Exercises</h3>
                <p class="card-text">Practice your Python skills with our coding exercises, ranging from beginner to advanced difficulty levels.</p>
                <a href="{% url 'exercises:exercise_list' %}" class="btn btn-sm btn-outline-primary">Try Exercises</a>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card h-100">
            <div class="card-body">
                <h3 class="card-title"><i class="bi bi-terminal text-primary me-2"></i>Online Code Editor</h3>
                <p class="card-text">Write, run, and test Python code directly in your browser with our feature-rich online code editor.</p>
                <a href="{% url 'editor:editor' %}" class="btn btn-sm btn-outline-primary">Open Editor</a>
            </div>
        </div>
    </div>
</div>
{% endblock %}
```

### 6. Create User Authentication System

#### 6.1 Create User Registration Form

Create `accounts/forms.py`:

```python
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Profile

class UserRegisterForm(UserCreationForm):
    email = forms.EmailField()
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

class UserUpdateForm(forms.ModelForm):
    email = forms.EmailField()
    
    class Meta:
        model = User
        fields = ['username', 'email']

class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['bio', 'avatar']
```

#### 6.2 Create Registration View

Update `accounts/views.py`:

```python
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import UserRegisterForm, UserUpdateForm, ProfileUpdateForm

def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}! You can now log in.')
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'accounts/register.html', {'form': form})

@login_required
def profile(request):
    if request.method == 'POST':
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user.profile)
        if u_form.is_valid() and p_form.is_valid():
            u_form.save()
            p_form.save()
            messages.success(request, 'Your profile has been updated!')
            return redirect('accounts:profile')
    else:
        u_form = UserUpdateForm(instance=request.user)
        p_form = ProfileUpdateForm(instance=request.user.profile)
    
    context = {
        'u_form': u_form,
        'p_form': p_form
    }
    return render(request, 'accounts/profile.html', context)
```

#### 6.3 Create Registration Template

Create `templates/accounts/register.html`:

```html
{% extends 'base.html' %}
{% load crispy_forms_tags %}

{% block title %}Register - Python Learning Platform{% endblock %}

{% block content %}
<div class="row justify-content-center">
    <div class="col-md-6">
        <div class="card">
            <div class="card-header bg-primary text-white">
                <h4 class="mb-0">Register</h4>
            </div>
            <div class="card-body">
                <form method="POST">
                    {% csrf_token %}
                    {{ form|crispy }}
                    <button type="submit" class="btn btn-primary">Register</button>
                </form>
                <div class="mt-3">
                    <small class="text-muted">
                        Already have an account? <a href="{% url 'login' %}">Log In</a>
                    </small>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}
```

#### 6.4 Create Login Template

Create `templates/registration/login.html`:

```html
{% extends 'base.html' %}
{% load crispy_forms_tags %}

{% block title %}Login - Python Learning Platform{% endblock %}

{% block content %}
<div class="row justify-content-center">
    <div class="col-md-6">
        <div class="card">
            <div class="card-header bg-primary text-white">
                <h4 class="mb-0">Login</h4>
            </div>
            <div class="card-body">
                <form method="POST">
                    {% csrf_token %}
                    {{ form|crispy }}
                    <button type="submit" class="btn btn-primary">Login</button>
                    <a href="{% url 'password_reset' %}" class="btn btn-link">Forgot Password?</a>
                </form>
                <div class="mt-3">
                    <small class="text-muted">
                        Need an account? <a href="{% url 'accounts:register' %}">Register</a>
                    </small>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}
```

#### 6.5 Configure URLs for Accounts App

Create `accounts/urls.py`:

```python
from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('register/', views.register, name='register'),
    path('profile/', views.profile, name='profile'),
    # More URLs will be added in Step 5 for progress tracking
]
```

### 7. Create Static Files Structure

Create the following directory structure for static files:

```
static/
    css/
        style.css
    js/
        main.js
    images/
        python-hero.svg
        logo.svg
```

### 8. Initialize Database

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 9. Run Development Server

```bash
python manage.py runserver
```

## Conclusion

In this step, we have successfully initialized the Python learning website project, set up the basic architecture, and implemented the user authentication system. The project now has a solid foundation with a responsive design and a user-friendly interface. In the next step, we will implement the course learning module.