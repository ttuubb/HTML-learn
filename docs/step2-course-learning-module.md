# Step 2: Course Learning Module Implementation

## Objective
Implement the course learning module for the Python learning website, including course content management, knowledge point display, example code demonstration, and quiz functionality.

## Detailed Tasks

### 1. Data Model Design

Define the following models in `courses/models.py`:

```python
from django.db import models
from django.urls import reverse
from django.utils.text import slugify

class Category(models.Model):
    """Course categories, such as 'Python Basics', 'Advanced Tutorials', etc."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)  # For sorting
    
    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Categories'
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Course(models.Model):
    """Courses, such as 'Python Basic Syntax', 'Variables and Data Types', etc."""
    category = models.ForeignKey(Category, related_name='courses', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    overview = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    order = models.IntegerField(default=0)  # For sorting
    is_published = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['category', 'order']
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('courses:course_detail', args=[self.slug])
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

class Lesson(models.Model):
    """Specific chapters in a course"""
    course = models.ForeignKey(Course, related_name='lessons', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200)
    content = models.TextField()  # Use rich text editor
    code_example = models.TextField(blank=True)  # Example code
    order = models.IntegerField(default=0)  # For sorting
    is_published = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['course', 'order']
        unique_together = ['course', 'slug']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"
    
    def get_absolute_url(self):
        return reverse('courses:lesson_detail', args=[self.course.slug, self.slug])

class Quiz(models.Model):
    """Quiz after a lesson chapter"""
    lesson = models.ForeignKey(Lesson, related_name='quizzes', on_delete=models.CASCADE)
    question = models.TextField()
    explanation = models.TextField(blank=True)  # Answer explanation
    
    def __str__(self):
        return f"Quiz for {self.lesson.title}"

class QuizOption(models.Model):
    """Quiz options"""
    quiz = models.ForeignKey(Quiz, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    
    def __str__(self):
        return self.text
```

### 2. Admin Panel Configuration

Register models in `courses/admin.py`:

```python
from django.contrib import admin
from .models import Category, Course, Lesson, Quiz, QuizOption

class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'order']
    prepopulated_fields = {'slug': ('name',)}

class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'created_at', 'updated_at', 'order', 'is_published']
    list_filter = ['category', 'is_published', 'created_at']
    search_fields = ['title', 'overview']
    prepopulated_fields = {'slug': ('title',)}

class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'is_published']
    list_filter = ['course', 'is_published']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}

class QuizOptionInline(admin.TabularInline):
    model = QuizOption
    extra = 4

class QuizAdmin(admin.ModelAdmin):
    list_display = ['question', 'lesson']
    list_filter = ['lesson']
    search_fields = ['question', 'explanation']
    inlines = [QuizOptionInline]

admin.site.register(Category, CategoryAdmin)
admin.site.register(Course, CourseAdmin)
admin.site.register(Lesson, LessonAdmin)
admin.site.register(Quiz, QuizAdmin)
```

### 3. URL Configuration

Configure URLs in `courses/urls.py`:

```python
from django.urls import path
from . import views

app_name = 'courses'

urlpatterns = [
    path('', views.course_list, name='course_list'),
    path('category/<slug:category_slug>/', views.course_list, name='course_list_by_category'),
    path('<slug:course_slug>/', views.course_detail, name='course_detail'),
    path('<slug:course_slug>/<slug:lesson_slug>/', views.lesson_detail, name='lesson_detail'),
    path('<slug:course_slug>/<slug:lesson_slug>/quiz/', views.take_quiz, name='take_quiz'),
]
```

### 4. View Implementation

Implement views in `courses/views.py`:

```python
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from .models import Category, Course, Lesson, Quiz, QuizOption
from accounts.models import CourseProgress, LessonProgress, QuizAttempt

def course_list(request, category_slug=None):
    """Display list of courses, optionally filtered by category"""
    categories = Category.objects.all()
    
    if category_slug: