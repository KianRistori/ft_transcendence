from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from core.models import Friendship

@login_required(login_url='signin')
def home(request):
    user_data = None
    friends = Friendship.objects.filter(user1=request.user) | Friendship.objects.filter(user2=request.user)
    if request.user.is_authenticated:
        # Get the user data you want to pass to the template
        user = request.user
        user_data = {
            'username': user.username,
            # Add other user data if needed
        }

    return render(request, 'online/home.html', {'user_data': user_data, 'friends': friends})

@login_required(login_url='signin')
def view_friends(request):
    friends = Friendship.objects.filter(user1=request.user) | Friendship.objects.filter(user2=request.user)
    return render(request, 'online/home.html', {'friends': friends})