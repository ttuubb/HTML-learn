# Step 4: Online Editor Module Implementation

## Objective
Implement the online editor module for the Python learning website, including code editing, execution, formatting, and result display functionality, providing users with a complete online Python programming environment.

## Detailed Tasks

### 1. Data Model Design

Define the following models in `editor/models.py`:

```python
from django.db import models
from django.contrib.auth.models import User

class CodeSnippet(models.Model):
    """User-saved code snippets"""
    user = models.ForeignKey(User, related_name='code_snippets', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    code = models.TextField()
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)  # Whether to share publicly
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title
```

### 2. Admin Panel Configuration

Register models in `editor/admin.py`:

```python
from django.contrib import admin
from .models import CodeSnippet

class CodeSnippetAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'is_public', 'created_at', 'updated_at']
    list_filter = ['is_public', 'created_at', 'user']
    search_fields = ['title', 'description', 'code']
    readonly_fields = ['created_at', 'updated_at']

admin.site.register(CodeSnippet, CodeSnippetAdmin)
```

### 3. URL Configuration

Configure URLs in `editor/urls.py`:

```python
from django.urls import path
from . import views

app_name = 'editor'

urlpatterns = [
    path('', views.editor, name='editor'),
    path('execute/', views.execute_code, name='execute_code'),
    path('format/', views.format_code, name='format_code'),
    path('save/', views.save_snippet, name='save_snippet'),
    path('snippets/', views.snippet_list, name='snippet_list'),
    path('snippets/<int:snippet_id>/', views.snippet_detail, name='snippet_detail'),
    path('snippets/<int:snippet_id>/edit/', views.edit_snippet, name='edit_snippet'),
    path('snippets/<int:snippet_id>/delete/', views.delete_snippet, name='delete_snippet'),
    path('public-snippets/', views.public_snippet_list, name='public_snippet_list'),
]
```

### 4. View Implementation

Implement views in `editor/views.py`:

```python
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
import subprocess
import tempfile
import os
import time
import json
import autopep8
from .models import CodeSnippet
from .forms import CodeSnippetForm

def editor(request):
    """Online editor homepage"""
    initial_code = """# Write your Python code here
print('Hello, World!')
"""
    return render(request, 'editor/editor.html', {
        'initial_code': initial_code
    })

@csrf_exempt
def execute_code(request):
    """Execute Python code and return the result"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            code = data.get('code', '')
            
            # Create a temporary file for the code
            with tempfile.NamedTemporaryFile(suffix='.py', delete=False) as temp_file:
                temp_file.write(code.encode('utf-8'))
                temp_file_path = temp_file.name
            
            # Execute the code with resource limits
            start_time = time.time()
            try:
                # Set timeout to 5 seconds to prevent infinite loops
                result = subprocess.run(
                    ['python', temp_file_path],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                execution_time = time.time() - start_time
                
                # Prepare response
                response_data = {
                    'stdout': result.stdout,
                    'stderr': result.stderr,
                    'execution_time': f"{execution_time:.3f} seconds"
                }
                
                return JsonResponse(response_data)
            except subprocess.TimeoutExpired:
                return JsonResponse({
                    'stdout': '',
                    'stderr': 'Execution timed out. Your code took too long to run.',
                    'execution_time': '> 5 seconds'
                })
            finally:
                # Clean up the temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
        except Exception as e:
            return JsonResponse({
                'stdout': '',
                'stderr': f'An error occurred: {str(e)}',
                'execution_time': ''
            })
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def format_code(request):
    """Format Python code using autopep8"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            code = data.get('code', '')
            
            # Format the code using autopep8
            formatted_code = autopep8.fix_code(code, options={'aggressive': 1})
            
            return JsonResponse({'formatted_code': formatted_code})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@login_required
def save_snippet(request):
    """Save code snippet"""
    if request.method == 'POST':
        form = CodeSnippetForm(request.POST)
        if form.is_valid():
            snippet = form.save(commit=False)
            snippet.user = request.user
            snippet.save()
            messages.success(request, 'Code snippet saved successfully!')
            return redirect('editor:snippet_detail', snippet_id=snippet.id)
    else:
        form = CodeSnippetForm()
    
    return render(request, 'editor/save_snippet.html', {'form': form})

@login_required
def snippet_list(request):
    """Display list of user's code snippets"""
    snippets = CodeSnippet.objects.filter(user=request.user)
    return render(request, 'editor/snippet_list.html', {'snippets': snippets})

def public_snippet_list(request):
    """Display list of public code snippets"""
    snippets = CodeSnippet.objects.filter(is_public=True)
    return render(request, 'editor/public_snippet_list.html', {'snippets': snippets})

def snippet_detail(request, snippet_id):
    """Display code snippet details"""
    snippet = get_object_or_404(CodeSnippet, id=snippet_id)
    
    # Check if user has permission to view this snippet
    if not snippet.is_public and (not request.user.is_authenticated or snippet.user != request.user):
        messages.error(request, "You don't have permission to view this snippet.")
        return redirect('editor:editor')
    
    return render(request, 'editor/snippet_detail.html', {'snippet': snippet})

@login_required
def edit_snippet(request, snippet_id):
    """Edit code snippet"""
    snippet = get_object_or_404(CodeSnippet, id=snippet_id)
    
    # Check if user has permission to edit this snippet
    if snippet.user != request.user:
        messages.error(request, "You don't have permission to edit this snippet.")
        return redirect('editor:snippet_list')
    
    if request.method == 'POST':
        form = CodeSnippetForm(request.POST, instance=snippet)
        if form.is_valid():
            form.save()
            messages.success(request, 'Code snippet updated successfully!')
            return redirect('editor:snippet_detail', snippet_id=snippet.id)
    else:
        form = CodeSnippetForm(instance=snippet)
    
    return render(request, 'editor/edit_snippet.html', {'form': form, 'snippet': snippet})

@login_required
def delete_snippet(request, snippet_id):
    """Delete code snippet"""
    snippet = get_object_or_404(CodeSnippet, id=snippet_id)
    
    # Check if user has permission to delete this snippet
    if snippet.user != request.user:
        messages.error(request, "You don't have permission to delete this snippet.")
        return redirect('editor:snippet_list')
    
    if request.method == 'POST':
        snippet.delete()
        messages.success(request, 'Code snippet deleted successfully!')
        return redirect('editor:snippet_list')
    
    return render(request, 'editor/delete_snippet.html', {'snippet': snippet})
```

### 5. Form Implementation

Create `editor/forms.py`:

```python
from django import forms
from .models import CodeSnippet

class CodeSnippetForm(forms.ModelForm):
    class Meta:
        model = CodeSnippet
        fields = ['title', 'code', 'description', 'is_public']
        widgets = {
            'code': forms.Textarea(attrs={'rows': 10}),
            'description': forms.Textarea(attrs={'rows': 3}),
        }
```

### 6. Template Implementation

#### 6.1 Editor Template

Create `templates/editor/editor.html`:

```html
{% extends 'base.html' %}
{% load static %}

{% block title %}Online Python Editor - Python Learning Platform{% endblock %}

{% block extra_css %}
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/monokai.min.css">
<style>
    .editor-container {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 200px);
        min-height: 500px;
    }
    .code-area {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    .CodeMirror {
        flex: 1;
        height: auto;
        font-family: 'Source Code Pro', monospace;
        font-size: 14px;
    }
    .output-area {
        height: 200px;
        overflow-y: auto;
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 0 0 4px 4px;
        padding: 10px;
        font-family: monospace;
        white-space: pre-wrap;
    }
    .toolbar {
        padding: 10px;
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 4px 4px 0 0;
        margin-bottom: -1px;
    }
</style>
{% endblock %}

{% block content %}
<div class="row mb-4">
    <div class="col-md-8">
        <h1>Online Python Editor</h1>
        <p class="lead">Write, run, and test your Python code directly in the browser.</p>
    </div>
    <div class="col-md-4 text-md-end">
        {% if user.is_authenticated %}
        <a href="{% url 'editor:snippet_list' %}" class="btn btn-outline-primary me-2">
            <i class="bi bi-collection"></i> My Snippets
        </a>
        {% endif %}
        <a href="{% url 'editor:public_snippet_list' %}" class="btn btn-outline-secondary">
            <i class="bi bi-share"></i> Public Snippets
        </a>
    </div>
</div>

<div class="editor-container">
    <div class="toolbar">
        <button id="run-btn" class="btn btn-primary">
            <i class="bi bi-play-fill"></i> Run
        </button>
        <button id="format-btn" class="btn btn-secondary">
            <i class="bi bi-text-indent-left"></i> Format
        </button>
        {% if user.is_authenticated %}
        <button id="save-btn" class="btn btn-success">
            <i class="bi bi-save"></i> Save
        </button>
        {% endif %}
        <button id="clear-btn" class="btn btn-danger">
            <i class="bi bi-trash"></i> Clear
        </button>
        <span id="execution-time" class="ms-3 text-muted"></span>
    </div>
    
    <div class="code-area">
        <textarea id="code-editor">{{ initial_code }}</textarea>
    </div>
    
    <div class="output-area" id="output">
        <!-- Code output will appear here -->
    </div>
</div>

<!-- Save Snippet Modal -->
{% if user.is_authenticated %}
<div class="modal fade" id="saveModal" tabindex="-1" aria-labelledby="saveModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="saveModalLabel">Save Code Snippet</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="save-form">
                    <div class="mb-3">
                        <label for="snippet-title" class="form-label">Title</label>
                        <input type="text" class="form-control" id="snippet-title" required>
                    </div>
                    <div class="mb-3">
                        <label for="snippet-description" class="form-label">Description</label>
                        <textarea class="form-control" id="snippet-description" rows="3"></textarea>
                    </div>
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="is-public">
                        <label class="form-check-label" for="is-public">
                            Make this snippet public
                        </label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="save-snippet-btn">Save Snippet</button>
            </div>
        </div>
    </div>
</div>
{% endif %}
{% endblock %}

{% block extra_js %}
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/python/python.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/matchbrackets.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/closebrackets.min.js"></script>
<script>
    // Initialize CodeMirror editor
    const editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
        mode: 'python',
        theme: 'monokai',
        lineNumbers: true,
        indentUnit: 4,
        matchBrackets: true,
        autoCloseBrackets: true,
        extraKeys: {
            'Tab': function(cm) {
                cm.replaceSelection('    ', 'end');
            }
        }
    });
    
    // Run code function
    document.getElementById('run-btn').addEventListener('click', function() {
        const code = editor.getValue();
        const outputArea = document.getElementById('output');
        const executionTime = document.getElementById('execution-time');
        
        // Clear previous output
        outputArea.textContent = 'Running code...';
        executionTime.textContent = '';
        
        // Send code to server for execution
        fetch('{% url "editor:execute_code" %}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': '{{ csrf_token }}'
            },
            body: JSON.stringify({ code: code })
        })
        .then(response => response.json())
        .then(data => {
            let output = '';
            
            if (data.stdout) {
                output += data.stdout;
            }
            
            if (data.stderr) {
                output += '\nError:\n' + data.stderr;
            }
            
            outputArea.textContent = output || 'No output';
            executionTime.textContent = 'Execution time: ' + data.execution_time;
        })
        .catch(error => {
            outputArea.textContent = 'Error: ' + error.message;
        });
    });
    
    // Format code function
    document.getElementById('format-btn').addEventListener('click', function() {
        const code = editor.getValue();
        
        fetch('{% url "editor:format_code" %}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': '{{ csrf_token }}'
            },
            body: JSON.stringify({ code: code })
        })
        .then(response => response.json())
        .then(data => {
            if (data.formatted_code) {
                editor.setValue(data.formatted_code);
            }
        })
        .catch(error => {
            console.error('Error formatting code:', error);
        });
    });
    
    // Clear editor function
    document.getElementById('clear-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the editor?')) {
            editor.setValue('');
            document.getElementById('output').textContent = '';
            document.getElementById('execution-time').textContent = '';
        }
    });
    
    {% if user.is_authenticated %}
    // Save button click handler
    document.getElementById('save-btn').addEventListener('click', function() {
        const saveModal = new bootstrap.Modal(document.getElementById('saveModal'));
        saveModal.show();
    });
    
    // Save snippet function
    document.getElementById('save-snippet-btn').addEventListener('click', function() {
        const title = document.getElementById('snippet-title').value;
        const description = document.getElementById('snippet-description').value;
        const isPublic = document.getElementById('is-public').checked;
        const code = editor.getValue();
        
        // Create form data
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('code', code);
        formData.append('is_public', isPublic);
        formData.append('csrfmiddlewaretoken', '{{ csrf_token }}');
        
        // Submit form
        fetch('{% url "editor:save_snippet" %}', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
            } else {
                return response.text();
            }
        })
        .catch(error => {
            console.error('Error saving snippet:', error);
            alert('Error saving snippet: ' + error.message);
        });
    });
    {% endif %}
</script>
{% endblock %}
```

#### 6.2 Snippet List Template

Create `templates/editor/snippet_list.html`:

```html
{% extends 'base.html' %}

{% block title %}My Code Snippets - Python Learning Platform{% endblock %}

{% block content %}
<div class="row mb-4">
    <div class="col-md-8">
        <h1>My Code Snippets</h1>
        <p class="lead">Manage your saved code snippets.</p>
    </div>
    <div class="col-md-4 text-md-end">
        <a href="{% url 'editor:editor' %}" class="btn btn-primary">
            <i class="bi bi-plus-lg"></i> New Snippet
        </a>
    </div>
</div>

{% if snippets %}
<div class="table-responsive">
    <table class="table table-striped table-hover">
        <thead>
            <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Visibility</th>
                <th>Last Updated</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {% for snippet in snippets %}
            <tr>
                <td>
                    <a href="{% url 'editor:snippet_detail' snippet.id %}">{{ snippet.title }}</a>
                </td>
                <td>{{ snippet.description|truncatechars:50 }}</td>
                <td>
                    {% if snippet.is_public %}
                    <span class="badge bg-success">Public</span>
                    {% else %}
                    <span class="badge bg-secondary">Private</span>
                    {% endif %}
                </td>
                <td>{{ snippet.updated_at|date:"M d, Y" }}</td>
                <td>
                    <a href="{% url 'editor:edit_snippet' snippet.id %}" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-pencil"></i>
                    </a>
                    <a href="{% url 'editor:delete_snippet' snippet.id %}" class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-trash"></i>
                    </a>
                </td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
</div>
{% else %}
<div class="alert alert-info">
    <p>You don't have any saved code snippets yet.</p>
    <a href="{% url 'editor:editor' %}" class="btn btn-primary mt-2">
        Create Your First Snippet
    </a>
</div>
{% endif %}
{% endblock %}
```

#### 6.3 Public Snippet List Template

Create `templates/editor/public_snippet_list.html`:

```html
{% extends 'base.html' %}

{% block title %}Public Code Snippets - Python Learning Platform{% endblock %}

{% block content %}
<div class="row mb-4">
    <div class="col">
        <h1>Public Code Snippets</h1>
        <p class="lead">Browse code snippets shared by the community.</p>
    </div>
</div>

{% if snippets %}
<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
    {% for snippet in snippets %}
    <div class="col">
        <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">{{ snippet.title }}</h5>
                <span class="badge bg-secondary">{{ snippet.user.username }}</span>
            </div>
            <div class="card-body">
                <p class="card-text">{{ snippet.description|truncatechars:100 }}</p>
            </div>
            <div class="card-footer">
                <small class="text-muted">Updated {{ snippet.updated_at|timesince }} ago</small>
                <a href="{% url 'editor:snippet_detail' snippet.id %}" class="btn btn-sm btn-primary float-end">View Code</a>
            </div>
        </div>
    </div>
    {% endfor %}
</div>
{% else %}
<div class="alert alert-info">
    <p>There are no public code snippets available yet.</p>
    {% if user.is_authenticated %}
    <a href="{% url 'editor:editor' %}" class="btn btn-primary mt-2">
        Create and Share a Snippet
    </a>
    {% endif %}
</div>
{% endif %}
{% endblock %}
```

#### 6.4 Snippet Detail Template

Create `templates/editor/snippet_detail.html`:

```html
{% extends 'base.html' %}
{% load static %}

{% block title %}{{ snippet.title }} - Python Learning Platform{% endblock %}

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
</style>
{% endblock %}

{% block content %}
<div class="row mb-4">
    <div class="col-md-8">
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                {% if snippet.user == request.user %}
                <li class="breadcrumb-item"><a href="{% url 'editor:snippet_list' %}">My Snippets</a></li>
                {% else %}
                <li class="breadcrumb-item"><a href="{% url 'editor:public_snippet_list' %}">Public Snippets</a></li>
                {% endif %}
                <li class="breadcrumb-item active">{{ snippet.title }}</li>
            </ol>
        </nav>
        <h1>{{ snippet.title }}</h1>
        <p class="text-muted">
            Created by {{ snippet.user.username }} on {{ snippet.created_at|date:"F d, Y" }}
            {% if snippet.is_public %}
            <span class="badge bg-success ms-2">Public</span>
            {% else %}
            <span class="badge bg-secondary ms-2">Private</span>
            {% endif %}
        </p>
    </div>
    <div class="col-md-4 text-md-end">
        {% if snippet.user == request.user %}
        <a href="{% url 'editor:edit_snippet' snippet.id %}" class="btn btn-outline-primary me-2">
            <i class="bi bi-pencil"></i> Edit
        </a>
        <a href="{% url 'editor:delete_snippet' snippet.id %}" class="btn btn-outline-danger">
            <i class="bi bi-trash"></i> Delete
        </a>
        {% endif %}
        <a href="{% url 'editor:editor' %}" class="btn btn-primary mt-2 mt-md-0">
            <i class="bi bi-code-slash"></i> Open in Editor
        </a>
    </div>
</div>

{% if snippet.description %}
<div class="card mb-4">
    <div class="card-header">
        <h5 class="mb-0">Description</h5>
    </div>
    <div class="card-body">
        {{ snippet.description|linebreaks }}
    </div>
</div>
{% endif %}

<div class="card mb-4">
    <div class="card-header">
        <h5 class="mb-0">Code</h5>
    </div>
    <div class="card-body p-0">
        <textarea id="code-display">{{ snippet.code }}</textarea>
    </div>
</div>

<div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Run Code</h5>
        <button id="run-btn" class="btn btn-primary btn-sm">
            <i class="bi bi-play-fill"></i> Run
        </button>
    </div>
    <div class="card-body">
        <div id="output" class="bg-light p-3 rounded" style="font-family: monospace; white-space: pre-wrap; min-height: 100px;">