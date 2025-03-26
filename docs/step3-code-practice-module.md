# Step 3: Code Practice Module Implementation

## Objective
Implement the code practice module for the Python learning website, including practice problem management, difficulty grading, code submission, and automatic evaluation functionality.

## Detailed Tasks

### 1. Data Model Design

Define the following models in `exercises/models.py`:

```python
from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils.text import slugify

class DifficultyLevel(models.Model):
    """Difficulty levels: Beginner, Intermediate, Advanced"""
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)  # For sorting
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class ExerciseType(models.Model):
    """Exercise types: Algorithm, Implementation, Bug Fix, Mini Project"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Exercise(models.Model):
    """Practice exercises"""
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    difficulty = models.ForeignKey(DifficultyLevel, related_name='exercises', on_delete=models.CASCADE)
    exercise_type = models.ForeignKey(ExerciseType, related_name='exercises', on_delete=models.CASCADE)
    description = models.TextField()  # Problem description
    input_description = models.TextField(blank=True)  # Input description
    output_description = models.TextField(blank=True)  # Output description
    example_input = models.TextField(blank=True)  # Example input
    example_output = models.TextField(blank=True)  # Example output
    initial_code = models.TextField(blank=True)  # Initial code
    solution_code = models.TextField(blank=True)  # Reference solution
    hints = models.TextField(blank=True)  # Hints
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['difficulty__order', 'created_at']
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('exercises:exercise_detail', args=[self.slug])
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

class TestCase(models.Model):
    """Test cases for exercises"""
    exercise = models.ForeignKey(Exercise, related_name='test_cases', on_delete=models.CASCADE)
    input_data = models.TextField()  # Input data
    expected_output = models.TextField()  # Expected output
    is_hidden = models.BooleanField(default=False)  # Whether to hide from users
    order = models.IntegerField(default=0)  # For sorting
    
    class Meta:
        ordering = ['exercise', 'order']
    
    def __str__(self):
        return f"Test case {self.order} for {self.exercise.title}"

class Submission(models.Model):
    """User code submissions"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('error', 'Error'),
    )
    
    RESULT_CHOICES = (
        ('accepted', 'Accepted'),
        ('wrong_answer', 'Wrong Answer'),
        ('time_limit_exceeded', 'Time Limit Exceeded'),
        ('memory_limit_exceeded', 'Memory Limit Exceeded'),
        ('runtime_error', 'Runtime Error'),
        ('compilation_error', 'Compilation Error'),
    )
    
    user = models.ForeignKey(User, related_name='submissions', on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, related_name='submissions', on_delete=models.CASCADE)
    code = models.TextField()
    language = models.CharField(max_length=20, default='python')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    result = models.CharField(max_length=30, choices=RESULT_CHOICES, null=True, blank=True)
    execution_time = models.FloatField(null=True, blank=True)  # in milliseconds
    memory_used = models.FloatField(null=True, blank=True)  # in KB
    error_message = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.user.username}'s submission for {self.exercise.title}"
```

### 2. Admin Panel Configuration

Register models in `exercises/admin.py`:

```python
from django.contrib import admin
from .models import DifficultyLevel, ExerciseType, Exercise, TestCase, Submission

class DifficultyLevelAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'order']
    prepopulated_fields = {'slug': ('name',)}

class ExerciseTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}

class TestCaseInline(admin.TabularInline):
    model = TestCase
    extra = 2

class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['title', 'difficulty', 'exercise_type', 'created_at', 'is_published']
    list_filter = ['difficulty', 'exercise_type', 'is_published', 'created_at']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [TestCaseInline]
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'difficulty', 'exercise_type', 'is_published')
        }),
        ('Problem Description', {
            'fields': ('description', 'input_description', 'output_description', 'example_input', 'example_output', 'hints')
        }),
        ('Code', {
            'fields': ('initial_code', 'solution_code')
        }),
    )

class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'exercise', 'result', 'status', 'execution_time', 'submitted_at']
    list_filter = ['status', 'result', 'submitted_at']
    search_fields = ['user__username', 'exercise__title', 'code']
    readonly_fields = ['user', 'exercise', 'code', 'language', 'status', 'result', 'execution_time', 'memory_used', 'error_message', 'submitted_at']

admin.site.register(DifficultyLevel, DifficultyLevelAdmin)
admin.site.register(ExerciseType, ExerciseTypeAdmin)
admin.site.register(Exercise, ExerciseAdmin)
admin.site.register(Submission, SubmissionAdmin)
```

### 3. URL Configuration

Configure URLs in `exercises/urls.py`:

```python
from django.urls import path
from . import views

app_name = 'exercises'

urlpatterns = [
    path('', views.exercise_list, name='exercise_list'),
    path('difficulty/<slug:difficulty_slug>/', views.exercise_list, name='exercise_list_by_difficulty'),
    path('type/<slug:type_slug>/', views.exercise_list, name='exercise_list_by_type'),
    path('<slug:exercise_slug>/', views.exercise_detail, name='exercise_detail'),
    path('<slug:exercise_slug>/submit/', views.submit_solution, name='submit_solution'),
    path('submission/<int:submission_id>/', views.submission_detail, name='submission_detail'),
    path('my-submissions/', views.my_submissions, name='my_submissions'),
]
```

### 4. View Implementation

Implement views in `exercises/views.py`:

```python
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.core.paginator import Paginator
from .models import DifficultyLevel, ExerciseType, Exercise, Submission, TestCase
from .forms import SubmissionForm
from .code_runner import run_code, evaluate_submission

def exercise_list(request, difficulty_slug=None, type_slug=None):
    """Display list of exercises, optionally filtered by difficulty or type"""
    exercises = Exercise.objects.filter(is_published=True)
    difficulties = DifficultyLevel.objects.all()
    exercise_types = ExerciseType.objects.all()
    
    if difficulty_slug:
        difficulty = get_object_or_404(DifficultyLevel, slug=difficulty_slug)
        exercises = exercises.filter(difficulty=difficulty)
        
    if type_slug:
        exercise_type = get_object_or_404(ExerciseType, slug=type_slug)
        exercises = exercises.filter(exercise_type=exercise_type)
    
    # Pagination
    paginator = Paginator(exercises, 10)  # 10 exercises per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return render(request, 'exercises/exercise_list.html', {
        'page_obj': page_obj,
        'difficulties': difficulties,
        'exercise_types': exercise_types,
        'current_difficulty': difficulty_slug,
        'current_type': type_slug,
    })

def exercise_detail(request, exercise_slug):
    """Display exercise details and code editor"""
    exercise = get_object_or_404(Exercise, slug=exercise_slug, is_published=True)
    
    # Get visible test cases
    test_cases = exercise.test_cases.filter(is_hidden=False)
    
    # Get user's previous submissions if logged in
    user_submissions = None
    if request.user.is_authenticated:
        user_submissions = Submission.objects.filter(
            user=request.user,
            exercise=exercise
        ).order_by('-submitted_at')[:5]  # Get last 5 submissions
    
    form = SubmissionForm(initial={'code': exercise.initial_code})
    
    return render(request, 'exercises/exercise_detail.html', {
        'exercise': exercise,
        'test_cases': test_cases,
        'form': form,
        'user_submissions': user_submissions,
    })

@login_required
def submit_solution(request, exercise_slug):
    """Handle code submission and evaluation"""
    exercise = get_object_or_404(Exercise, slug=exercise_slug, is_published=True)
    
    if request.method == 'POST':
        form = SubmissionForm(request.POST)
        if form.is_valid():
            code = form.cleaned_data['code']
            
            # Create submission record
            submission = Submission.objects.create(
                user=request.user,
                exercise=exercise,
                code=code,
                status='running'
            )
            
            # Run code evaluation in background task
            # (In a real implementation, this would be handled by Celery or similar)
            try:
                result = evaluate_submission(submission)
                return redirect('exercises:submission_detail', submission_id=submission.id)
            except Exception as e:
                submission.status = 'error'
                submission.error_message = str(e)
                submission.save()
                messages.error(request, f"Error processing submission: {str(e)}")
                return redirect('exercises:exercise_detail', exercise_slug=exercise_slug)
    else:
        form = SubmissionForm(initial={'code': exercise.initial_code})
    
    return render(request, 'exercises/exercise_detail.html', {
        'exercise': exercise,
        'form': form,
    })

@login_required
def submission_detail(request, submission_id):
    """Display details of a specific submission"""
    submission = get_object_or_404(Submission, id=submission_id)
    
    # Check if user is allowed to view this submission
    if submission.user != request.user and not request.user.is_staff:
        messages.error(request, "You don't have permission to view this submission.")
        return redirect('exercises:exercise_list')
    
    return render(request, 'exercises/submission_detail.html', {
        'submission': submission,
        'exercise': submission.exercise,
    })

@login_required
def my_submissions(request):
    """Display list of user's submissions"""
    submissions = Submission.objects.filter(user=request.user).order_by('-submitted_at')
    
    # Pagination
    paginator = Paginator(submissions, 20)  # 20 submissions per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return render(request, 'exercises/my_submissions.html', {
        'page_obj': page_obj,
    })
```

### 5. Form Implementation

Create `exercises/forms.py`:

```python
from django import forms

class SubmissionForm(forms.Form):
    code = forms.CharField(widget=forms.Textarea, required=True)
```

### 6. Code Runner Implementation

Create `exercises/code_runner.py` for code execution and evaluation:

```python
import subprocess
import tempfile
import os
import time
import signal
from contextlib import contextmanager

class TimeoutException(Exception):
    pass

@contextmanager
def time_limit(seconds):
    """Context manager for limiting execution time"""
    def signal_handler(signum, frame):
        raise TimeoutException("Time limit exceeded")
    
    signal.signal(signal.SIGALRM, signal_handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)

def run_code(code, input_data=None, timeout=5):
    """Run Python code with the given input and return the output"""
    # Create a temporary file for the code
    with tempfile.NamedTemporaryFile(suffix='.py', delete=False) as temp_file:
        temp_file.write(code.encode('utf-8'))
        temp_file_path = temp_file.name
    
    try:
        # Run the code with the given input
        start_time = time.time()
        
        with time_limit(timeout):
            process = subprocess.Popen(
                ['python', temp_file_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = process.communicate(input=input_data, timeout=timeout)
        
        execution_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        return {
            'stdout': stdout,
            'stderr': stderr,
            'execution_time': execution_time,
            'return_code': process.returncode
        }
    except TimeoutException:
        return {
            'stdout': '',
            'stderr': 'Time limit exceeded',
            'execution_time': timeout * 1000,
            'return_code': -1
        }
    except subprocess.TimeoutExpired:
        process.kill()
        return {
            'stdout': '',
            'stderr': 'Time limit exceeded',
            'execution_time': timeout * 1000,
            'return_code': -1
        }
    except Exception as e:
        return {
            'stdout': '',
            'stderr': str(e),
            'execution_time': 0,
            'return_code': -1
        }
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

def evaluate_submission(submission):
    """Evaluate a submission against all test cases"""
    exercise = submission.exercise
    test_cases = exercise.test_cases.all()
    
    # Update submission status
    submission.status = 'running'
    submission.save()
    
    all_passed = True
    total_execution_time = 0
    error_message = ''
    
    for test_case in test_cases:
        # Run the code with the test case input
        result = run_code(submission.code, test_case.input_data)
        
        total_execution_time += result['execution_time']
        
        # Check for errors
        if result['return_code'] != 0:
            all_passed = False
            if result['stderr'] == 'Time limit exceeded':
                submission.result = 'time_limit_exceeded'
            else:
                submission.result = 'runtime_error'
            
            error_message = result['stderr']
            break
        
        # Compare output with expected output
        # Normalize line endings and whitespace
        actual_output = result['stdout'].strip()
        expected_output = test_case.expected_output.strip()
        
        if actual_output != expected_output:
            all_passed = False
            submission.result = 'wrong_answer'
            error_message = f"Test case failed. Expected:\n{expected_output}\n\nGot:\n{actual_output}"
            break
    
    # Update submission with results
    if all_passed:
        submission.result = 'accepted'
    
    submission.status = 'completed'
    submission.execution_time = total_execution_time / len(test_cases) if test_cases else 0
    submission.error_message = error_message
    submission.save()
    
    return submission
```

### 7. Template Implementation

#### 7.1 Exercise List Template

Create `templates/exercises/exercise_list.html`:

```html
{% extends 'base.html' %}
{% load static %}

{% block title %}Practice Exercises - Python Learning Platform{% endblock %}

{% block content %}
<div class="row mb-4">
    <div class="col-md-8">
        <h1>Python Practice Exercises</h1>
        <p class="lead">Improve your Python skills with our collection of practice exercises.</p>
    </div>
    <div class="col-md-4 text-md-end">
        {% if user.is_authenticated %}
        <a href="{% url 'exercises:my_submissions' %}" class="btn btn-outline-primary">
            <i class="bi bi-clock-history"></i> My Submissions
        </a>
        {% endif %}
    </div>
</div>

<div class="row">
    <!-- Filters -->
    <div class="col-md-3 mb-4">
        <div class="card">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Filters</h5>
            </div>
            <div class="card-body">
                <h6>Difficulty</h6>
                <div class="list-group mb-3">
                    <a href="{% url 'exercises:exercise_list' %}" class="list-group-item list-group-item-action {% if not current_difficulty %}active{% endif %}">
                        All Difficulties
                    </a>
                    {% for difficulty in difficulties %}
                    <a href="{% url 'exercises:exercise_list_by_difficulty' difficulty.slug %}" class="list-group-item list-group-item-action {% if current_difficulty == difficulty.slug %}active{% endif %}">
                        {{ difficulty.name }}
                    </a>
                    {% endfor %}
                </div>
                
                <h6>Exercise Type</h6>
                <div class="list-group">
                    <a href="{% url 'exercises:exercise_list' %}" class="list-group-item list-group-item-action {% if not current_type %}active{% endif %}">
                        All Types
                    </a>
                    {% for type in exercise_types %}
                    <a href="{% url 'exercises:exercise_list_by_type' type.slug %}" class="list-group-item list-group-item-action {% if current_type == type.slug %}active{% endif %}">
                        {{ type.name }}
                    </a>
                    {% endfor %}
                </div>
            </div>
        </div>
    </div>
    
    <!-- Exercise List -->
    <div class="col-md-9">
        {% if page_obj %}
            <div class="row row-cols-1 row-cols-md-2 g-4">
                {% for exercise in page_obj %}
                <div class="col">
                    <div class="card h-100">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <span class="badge bg-{{ exercise.difficulty.name|lower }}">{{ exercise.difficulty.name }}</span>
                            <span class="badge bg-secondary">{{ exercise.exercise_type.name }}</span>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">{{ exercise.title }}</h5>
                            <p class="card-text">{{ exercise.description|truncatewords:20 }}</p>
                        </div>
                        <div class="card-footer">
                            <a href="{% url 'exercises:exercise_detail' exercise.slug %}" class="btn btn-primary btn-sm">Solve Challenge</a>
                        </div>
                    </div>
                </div>
                {% endfor %}
            </div>
            
            <!-- Pagination -->
            {% if page_obj.has_other_pages %}
            <nav aria-label="Page navigation" class="mt-4">
                <ul class="pagination justify-content-center">
                    {% if page_obj.has_previous %}
                    <li class="page-item">
                        <a class="page-link" href="?page={{ page_obj.previous_page_number }}">&laquo; Previous</a>
                    </li>
                    {% else %}
                    <li class="page-item disabled">
                        <span class="page-link">&laquo; Previous</span>
                    </li>
                    {% endif %}
                    
                    {% for i in page_obj.paginator.page_range %}
                        {% if page_obj.number == i %}
                        <li class="page-item active">
                            <span class="page-link">{{ i }}</span>
                        </li>
                        {% else %}
                        <li class="page-item">
                            <a class="page-link" href="?page={{ i }}">{{ i }}</a>
                        </li>
                        {% endif %}
                    {% endfor %}
                    
                    {% if page_obj.has_next %}
                    <li class="page-item">
                        <a class="page-link" href="?page={{ page_obj.next_page_number }}">Next &raquo;</a>
                    </li>
                    {% else %}
                    <li class="page-item disabled">
                        <span class="page-link">Next &raquo;</span>
                    </li>
                    {% endif %}
                </ul>
            </nav>
            {% endif %}
        {% else %}
            <div class="alert alert-info">
                No exercises found matching your criteria.
            </div>
        {% endif %}
    </div>
</div>
{% endblock %}
```

#### 7.2 Exercise Detail Template

Create `templates/exercises/exercise_detail.html`:

```html
{% extends 'base.html' %}
{% load static %}

{% block title %}{{ exercise.title }} - Python Learning Platform{% endblock %}

{% block extra_css %}
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/monokai.min.css">
<style>
    .CodeMirror {
        height: 400px;
        border: 1px solid #ddd;
        font-family: 'Source Code Pro', monospace;
        font-size: 14px;
    }
    .test-case {
        background-color: #f8f9fa;
        border-radius: 5px;
        padding: 15px;
        margin-bottom: 15px;
    }
    .code-output {
        background-color: #f8f9fa;
        border-radius: 5px;
        padding: 15px;
        font-family: monospace;
        white-space: pre-wrap;
        max-height: 200px;
        overflow-y: auto;
    }
</style>
{% endblock %}

{% block content %}
<div class="row">
    <div class="col-md-12 mb-4">
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="{% url 'exercises:exercise_list' %}">Exercises</a></li>
                <li class="breadcrumb-item active">{{ exercise.title }}</li>
            </ol>
        </nav>
        
        <div class="d-flex justify-content-between align-items-center">
            <h1>{{ exercise.title }}</h1>
            <div>
                <span class="badge bg-{{ exercise.difficulty.name|lower }} me-2">{{ exercise.difficulty.name }}</span>
                <span class="badge bg-secondary">{{ exercise.exercise_type.name }}</span>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- Problem Description -->
    <div class="col-md-5">
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Problem Description</h5>
            </div>
            <div class="card-body">
                <div class="mb-4">
                    {{ exercise.description|safe }}
                </div>
                
                {% if exercise.input_description or exercise.output_description %}
                <div class="mb-4">
                    {% if exercise.input_description %}
                    <h6>Input Format:</h6>
                    <p>{{ exercise.input_description|linebreaksbr }}</p>
                    {% endif %}
                    
                    {% if exercise.output_description %}
                    <h6>Output Format:</h6>
                    <p>{{ exercise.output_description|linebreaksbr }}</p>
                    {% endif %}
                </div>
                {% endif %}
                
                {% if exercise.example_input or exercise.example_output %}
                <div class="mb-4">
                    <h6>Example:</h6>
                    <div class="test-case">
                        {% if exercise.example_input %}
                        <div class="mb-2">
                            <strong>Input:</strong>
                            <pre>{{ exercise.example_input }}</pre>
                        </div>
                        {% endif %}
                        
                        {% if exercise.example_output %}
                        <div>
                            <strong>Output:</strong>
                            <pre>{{ exercise.example_output }}</pre>
                        </div>
                        {% endif %}
                    </div>
                </div>
                {% endif %}
                
                {% if test_cases %}
                <div class="mb-4">
                    <h6>Test Cases:</h6>
                    {% for test_case in test_cases %}
                    <div class="test-case">
                        <div class="mb-2">
                            <strong>Input:</strong>
                            <pre>{{ test_case.input_data }}</pre>
                        </div>
                        <div>
                            <strong>Expected Output:</strong>
                            <pre>{{ test_case.expected_output }}</pre>
                        </div>
                    </div>
                    {% endfor %}
                </div>
                {% endif %}
                
                {% if exercise.hints %}
                <div class="mb-4">
                    <h6>Hints:</h6>
                    <p>{{ exercise.hints|linebreaksbr }}</p>
                </div>
                {% endif %}