from django.shortcuts import render, redirect
from django.contrib.auth import logout
from .forms import SignupForm

def home(request):
    return render(request, 'core/home.html', {'user': request.user})

def signup(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)

        if form.is_valid():
            form.save()

            return redirect('/')
    else:
        form = SignupForm()

    return render(request, 'auth/signup.html', {
        'form': form
    })

def logout_view(request):
    logout(request)
    return redirect('/')