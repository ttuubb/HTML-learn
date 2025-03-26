# Step 5: Learning Progress Tracking Module Implementation

## Objective
Implement the learning progress tracking module for the Python learning website, including user account management, learning progress tracking, note management, and favorites functionality, providing users with a personalized learning experience.

## Detailed Tasks

### 1. Data Model Design

Define the following models in `accounts/models.py`:

```python
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from courses.models import Course, Lesson
from exercises.models import Exercise

class Profile(models.Model):
    """User profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"

# Create profile automatically when user is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class CourseProgress(models.Model):
    """Course learning progress"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_progress')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='progress')
    started_at = models.DateTimeField(auto_now_add=True)
    last_accessed_at = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'course']
    
    def __str__(self):
        return f"{self.user.username}'s progress on {self.course.title}"

class LessonProgress(models.Model):
    """Lesson chapter learning progress"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress')
    is_completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    last_accessed_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'lesson']
    
    def __str__(self):
        return f"{self.user.username}'s progress on {self.lesson.title}"

class QuizAttempt(models.Model):
    """Quiz attempt record"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='quiz_attempts')
    score = models.IntegerField()  # Score
    max_score = models.IntegerField()  # Maximum score
    attempt_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-attempt_date']
    
    def __str__(self):
        return f"{self.user.username}'s quiz attempt for {self.lesson.title}"
    
    @property
    def percentage(self):
        """Calculate percentage score"""
        if self.max_score > 0:
            return (self.score / self.max_score) * 100
        return 0

class Note(models.Model):
    """User notes"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=200)
    content = models.TextField()
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='notes', null=True, blank=True)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='notes', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title

class Favorite(models.Model):
    """User favorites"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='favorites', null=True, blank=True)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='favorites', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [
            ['user', 'lesson'],
            ['user', 'exercise'],
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        if self.lesson:
            return f"{self.user.username}'s favorite lesson: {self.lesson.title}"
        elif self.exercise:
            return f"{self.user.username}'s favorite exercise: {self.exercise.title}"
        return f"{self.user.username}'s favorite"
```

### 2. Admin Panel Configuration

Register models in `accounts/admin.py`:

```python
from django.contrib import admin
from .models import Profile, CourseProgress, LessonProgress, QuizAttempt, Note, Favorite

class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'updated_at']
    search_fields = ['user__username', 'user__email', 'bio']

class CourseProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'started_at', 'last_accessed_at', 'is_completed']
    list_filter = ['is_completed', 'started_at']
    search_fields = ['user__username', 'course__title']

class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'lesson', 'is_completed', 'last_accessed_at']
    list_filter = ['is_completed', 'last_accessed_at']
    search_fields = ['user__username', 'lesson__title']

class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'lesson', 'score', 'max_score', 'percentage', 'attempt_date']
    list_filter = ['attempt_date']
    search_fields = ['user__username', 'lesson__title']

class NoteAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'lesson', 'exercise', 'created_at', 'updated_at']
    list_filter = ['created_at']
    search_fields = ['title', 'content', 'user__username']

class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'lesson', 'exercise', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'lesson__title', 'exercise__title']

admin.site.register(Profile, ProfileAdmin)
admin.site.register(CourseProgress, CourseProgressAdmin)
admin.site.register(LessonProgress, LessonProgressAdmin)
admin.site.register(QuizAttempt, QuizAttemptAdmin)
admin.site.register(Note, NoteAdmin)
admin.site.register(Favorite, FavoriteAdmin)
```

### 3. URL Configuration

Update `accounts/urls.py`:

```python
from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('register/', views.register, name='register'),
    path('profile/', views.profile, name='profile'),
    path('progress/', views.progress_overview, name='progress'),
    path('progress/course/<int:course_id>/', views.course_progress, name='course_progress'),
    path('notes/', views.note_list, name='notes'),
    path('notes/create/', views.create_note, name='create_note'),
    path('notes/<int:note_id>/', views.note_detail, name='note_detail'),
    path('notes/<int:note_id>/edit/', views.edit_note, name='edit_note'),
    path('notes/<int:note_id>/delete/', views.delete_note, name='delete_note'),
    path('favorites/', views.favorite_list, name='favorites'),
    path('favorite/toggle/lesson/<int:lesson_id>/', views.toggle_favorite_lesson, name='toggle_favorite_lesson'),
    path('favorite/toggle/exercise/<int:exercise_id>/', views.toggle_favorite_exercise, name='toggle_favorite_exercise'),
]
```

### 4. View Implementation

Implement views in `accounts/views.py`:

```python
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.http import JsonResponse
from django.db.models import Count, Q
from .forms import UserRegisterForm, UserUpdateForm, ProfileUpdateForm, NoteForm
from .models import Profile, CourseProgress, LessonProgress, QuizAttempt, Note, Favorite
from courses.models import Course, Lesson
from exercises.models import Exercise, Submission

def register(request):
    """User registration view"""
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
    """User profile view"""
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

@login_required
def progress_overview(request):
    """Overview of user's learning progress"""
    # Get course progress
    course_progress = CourseProgress.objects.filter(user=request.user)
    courses_completed = course_progress.filter(is_completed=True).count()
    courses_in_progress = course_progress.filter(is_completed=False).count()
    
    # Get lesson progress
    lesson_progress = LessonProgress.objects.filter(user=request.user)
    lessons_completed = lesson_progress.filter(is_completed=True).count()
    lessons_in_progress = lesson_progress.filter(is_completed=False).count()
    
    # Get exercise statistics
    submissions = Submission.objects.filter(user=request.user)
    exercises_attempted = submissions.values('exercise').distinct().count()
    exercises_completed = submissions.filter(result='accepted').values('exercise').distinct().count()
    
    # Get quiz statistics
    quiz_attempts = QuizAttempt.objects.filter(user=request.user)
    quizzes_taken = quiz_attempts.count()
    avg_quiz_score = quiz_attempts.values('lesson').annotate(max_score=Count('id')).aggregate(avg=Avg('score'))
    
    # Get recent activity
    recent_course_progress = course_progress.order_by('-last_accessed_at')[:5]
    recent_lesson_progress = lesson_progress.order_by('-last_accessed_at')[:5]
    recent_submissions = submissions.order_by('-submitted_at')[:5]
    recent_quiz_attempts = quiz_attempts.order_by('-attempt_date')[:5]
    
    context = {
        'courses_completed': courses_completed,
        'courses_in_progress': courses_in_progress,
        'lessons_completed': lessons_completed,
        'lessons_in_progress': lessons_in_progress,
        'exercises_attempted': exercises_attempted,
        'exercises_completed': exercises_completed,
        'quizzes_taken': quizzes_taken,
        'avg_quiz_score': avg_quiz_score['avg'] if avg_quiz_score['avg'] else 0,
        'recent_course_progress': recent_course_progress,
        'recent_lesson_progress': recent_lesson_progress,
        'recent_submissions': recent_submissions,
        'recent_quiz_attempts': recent_quiz_attempts,
    }
    return render(request, 'accounts/progress_overview.html', context)

@login_required
def course_progress(request, course_id):
    """Detailed progress for a specific course"""
    course = get_object_or_404(Course, id=course_id)
    
    # Get or create course progress
    course_prog, created = CourseProgress.objects.get_or_create(
        user=request.user,
        course=course,
        defaults={'started_at': timezone.now()}
    )
    
    # Get lesson progress for this course
    lessons = course.lessons.all()
    lesson_progress = {}
    
    for lesson in lessons:
        # Get or create lesson progress
        lesson_prog, created = LessonProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson
        )
        
        # Get quiz attempts for this lesson
        quiz_attempts = QuizAttempt.objects.filter(
            user=request.user,
            lesson=lesson
        ).order_by('-attempt_date')
        
        lesson_progress[lesson.id] = {
            'lesson': lesson,
            'progress': lesson_prog,
            'quiz_attempts': quiz_attempts
        }
    
    context = {
        'course': course,
        'course_progress': course_prog,
        'lesson_progress': lesson_progress,
    }
    return render(request, 'accounts/course_progress.html', context)

@login_required
def note_list(request):
    """List all user's notes"""
    notes = Note.objects.filter(user=request.user)
    return render(request, 'accounts/note_list.html', {'notes': notes})

@login_required
def create_note(request):
    """Create a new note"""
    if request.method == 'POST':
        form = NoteForm(request.POST)
        if form.is_valid():
            note = form.save(commit=False)
            note.user = request.user
            note.save()
            messages.success(request, 'Note created successfully!')
            return redirect('accounts:note_detail', note_id=note.id)
    else:
        # Pre-fill lesson or exercise if provided in GET parameters
        initial_data = {}
        lesson_id = request.GET.get('lesson')
        exercise_id = request.GET.get('exercise')
        
        if lesson_id:
            try:
                lesson = Lesson.objects.get(id=lesson_id)
                initial_data['lesson'] = lesson
                initial_data['title'] = f"Notes on {lesson.title}"
            except Lesson.DoesNotExist:
                pass
        
        if exercise_id:
            try:
                exercise = Exercise.objects.get(id=exercise_id)
                initial_data['exercise'] = exercise
                initial_data['title'] = f"Notes on {exercise.title}"
            except Exercise.DoesNotExist:
                pass
        
        form = NoteForm(initial=initial_data)
    
    return render(request, 'accounts/create_note.html', {'form': form})

@login_required
def note_detail(request, note_id):
    """View a specific note"""
    note = get_object_or_404(Note, id=note_id, user=request.user)
    return render(request, 'accounts/note_detail.html', {'note': note})

@login_required
def edit_note(request, note_id):
    """Edit an existing note"""
    note = get_object_or_404(Note, id=note_id, user=request.user)
    
    if request.method == 'POST':
        form = NoteForm(request.POST, instance=note)
        if form.is_valid():
            form.save()
            messages.success(request, 'Note updated successfully!')
            return redirect('accounts:note_detail', note_id=note.id)
    else:
        form = NoteForm(instance=note)
    
    return render(request, 'accounts/edit_note.html', {'form': form, 'note': note})

@login_required
def delete_note(request, note_id):
    """Delete a note"""
    note = get_object_or_404(Note, id=note_id, user=request.user)
    
    if request.method == 'POST':
        note.delete()
        messages.success(request, 'Note deleted successfully!')
        return redirect('accounts:notes')
    
    return render(request, 'accounts/delete_note.html', {'note': note})

@login_required
def favorite_list(request):
    """List all user's favorites"""
    favorites = Favorite.objects.filter(user=request.user)
    return render(request, 'accounts/favorite_list.html', {'favorites': favorites})

@login_required
def toggle_favorite_lesson(request, lesson_id):
    """Toggle favorite status for a lesson"""
    lesson = get_object_or_404(Lesson, id=lesson_id)
    
    # Check if already favorited
    favorite, created = Favorite.objects.get_or_create(
        user=request.user,
        lesson=lesson,
        defaults={'created_at': timezone.now()}
    )
    
    # If it existed and we didn't create it, then delete it (unfavorite)
    if not created:
        favorite.delete()
        is_favorited = False
    else:
        is_favorited = True
    
    # Return JSON response for AJAX requests
    if request.is_ajax():
        return JsonResponse({'is_favorited': is_favorited})
    
    # Redirect back to the lesson page for non-AJAX requests
    return redirect('courses:lesson_detail', course_slug=lesson.course.slug, lesson_slug=lesson.slug)

@login_required
def toggle_favorite_exercise(request, exercise_id):
    """Toggle favorite status for an exercise"""
    exercise = get_object_or_404(Exercise, id=exercise_id)
    
    # Check if already favorited
    favorite, created = Favorite.objects.get_or_create(
        user=request.user,
        exercise=exercise,
        defaults={'created_at': timezone.now()}
    )
    
    # If it existed and we didn't create it, then delete it (unfavorite)
    if not created:
        favorite.delete()
        is_favorited = False
    else:
        is_favorited = True
    
    # Return JSON response for AJAX requests
    if request.is_ajax():
        return JsonResponse({'is_favorited': is_favorited})
    
    # Redirect back to the exercise page for non-AJAX requests
    return redirect('exercises:exercise_detail', exercise_slug=exercise.slug)
```

### 5. Form Implementation

Create `accounts/forms.py`:

```python
from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Profile, Note
from courses.models import Lesson
from exercises.models import Exercise

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

class NoteForm(forms.ModelForm):
    class Meta:
        model = Note
        fields = ['title', 'content', 'lesson', 'exercise']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 10}),
            'lesson': forms.Select(attrs={'class': 'form-select'}),
            'exercise': forms.Select(attrs={'class': 'form-select'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['lesson'].required = False
        self.fields['exercise'].required = False
        
        # Add empty option
        self.fields['lesson'].empty_label = "No lesson (general note)"
        self.fields['exercise'].empty_label = "No exercise (general note)"
```

### 6. Template Implementation

#### 6.1 Progress Overview Template

Create `templates/accounts/progress_overview.html`:

```html
{% extends 'base.html' %}

{% block title %}My Learning Progress - Python Learning Platform{% endblock %}

{% block content %}
<div class="row mb-4">
    <div class="col">
        <h1>My Learning Progress</h1>
        <p class="lead">Track your learning journey and achievements.</p>
    </div>
</div>

<!-- Progress Summary -->
<div class="row mb-4">
    <div class="col-md-3">
        <div class="card text-center h-100">
            <div class="card-body">
                <h5 class="card-title">Courses</h5>
                <div class="display-4 mb-2">{{ courses_completed }}</div>
                <p class="text-muted">Completed</p>
                <div class="progress">
                    <div class="progress-bar bg-success" role="progressbar" style="width: {% if courses_completed or courses_in_progress %}{{ courses_completed|floatformat:0 }}%{% else %}0%{% endif %}" aria-valuenow="{{ courses_completed }}" aria-valuemin="0" aria-valuemax="{{ courses_completed|add:courses_in_progress }}"></div>
                </div>
                <p class="mt-2 text-muted">{{ courses_in_progress }} in progress</p>
            </div>
        </div>
    </div>
    
    <div class="col-md-3">
        <div class="card text-center h-100">
            <div class="card-body">
                <h5 class="card-title">Lessons</h5>
                <div class="display-4 mb-2">{{ lessons_completed }}</div>
                <p class="text-muted">Completed</p>
                <div class="progress">
                    <div class="progress-bar bg-success" role="progressbar" style="width: {% if lessons_completed or lessons_in_progress %}{{ lessons_completed|floatformat:0 }}%{% else %}0%{% endif %}" aria-valuenow="{{ lessons_completed }}" aria-valuemin="0" aria-valuemax="{{ lessons_completed|add:lessons_in_progress }}"></div>
                </div>
                <p class="mt-2 text-muted">{{ lessons_in_progress }} in progress</p>
            </div>
        </div>
    </div>
    
    <div class="col-md-3">
        <div class="card text-center h-100">
            <div class="card-body">
                <h5 class="card-title">Exercises</h5>
                <div class="display-4 mb-2">{{ exercises_completed }}</div>
                <p class="text-muted">Completed</p>
                <div class="progress">
                    <div class="progress-bar bg-success" role="progressbar" style="width: {% if exercises_attempted %}{{ exercises_completed|floatformat:0 }}%{% else %}0%{% endif %}" aria-valuenow="{{ exercises_completed }}" aria-valuemin="0" aria-valuemax="{{ exercises_attempted }}"></div>
                </div>
                <p class="mt-2 text-muted">{{ exercises_attempted }} attempted</p>
            </div>
        </div>
    </div>
    
    <div class="col-md-3">
        <div class="card text-center h-100">
            <div class="card-body">
                <h5 class="card-title">Quizzes</h5>
                <div class="display-4 mb-2">{{ quizzes_taken }}</div>
                <p class="text-muted">Completed</p>
                <div class="progress">
                    <div class="progress-bar bg-success" role="progressbar" style="width: {{ avg_quiz_score }}%" aria-valuenow="{{ avg_quiz_score }}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <p class="mt-2 text-muted">{{ avg_quiz_score|floatformat:1 }}% average score</p>
            </div>
        </div>
    </div>
</div>

<!-- Recent Activity -->
<div class="row">
    <div class="col-md-6">
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Recent Course Activity</h5>
            </div>
            <div class="card-body">
                {% if recent_course_progress %}
                <div class="list-group">
                    {% for progress in recent_course_progress %}
                    <a href="{% url 'accounts:course_progress' progress.course.id %}" class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">{{ progress.course.title }}</h6>
                            <small>{{ progress.last_accessed_at|timesince }} ago</small>
                        </div>
                        <p class="mb-1">{% if progress.is_completed %}Completed{% else %}In Progress{% endif %}</p>
                    </a>
                    {% endfor %}
                </div>
                {% else %}
                <p class="text-muted">No recent course activity.</p>
                {% endif %}
            </div>
        </div>
        
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Recent Lesson Activity</h5>
            </div>
            <div class="card-body">
                {% if recent_lesson_progress %}
                <div class="list-group">
                    {% for progress in recent_lesson_progress %}
                    <a href="{% url 'courses:lesson_detail' progress.lesson.course.slug progress.lesson.slug %}" class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">{{ progress.lesson.title }}</h6>
                            <small>{{ progress.last_accessed_at|timesince }} ago</small>
                        </div>
                        <p class="mb-1">{{ progress.lesson.course.title }}</p>
                        <small>{% if progress.is_completed %}Completed{% else %}In Progress{% endif %}</small>
                    </a>
                    {% endfor %}
                </div>
                {% else %}
                <p class="text-muted">No recent lesson activity.</p>
                {% endif %}
            </div>
        </div>
    </div>
    
    <div class="col-md-6">
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Recent Exercise Submissions</h5>
            </div>
            <div class="card-body">
                {% if recent_submissions %}
                <div class="list-group">
                    {% for submission in recent_submissions %}
                    <a href="{% url 'exercises:submission_detail' submission.id %}" class="list-group-item list-group-item-action">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-