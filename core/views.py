from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User, auth
from django.db.models import Q
from django.contrib import messages
from .models import Profile, Friendship, FriendRequest, Message
from django.contrib.auth.decorators import login_required
from .forms import MessageForm

def home(request):
    return render(request, 'core/home.html')

def signup(request):

    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        password2 = request.POST['password2']

        if password == password2:
            if User.objects.filter(email=email).exists():
                messages.info(request, 'Email Taken')
                return redirect('signup')
            elif User.objects.filter(username=username).exists():
                messages.info(request, 'Username Taken')
                return redirect('signup')
            else:
                user = User.objects.create_user(username=username, email=email, password=password)
                user.save()

                user_login = auth.authenticate(username=username, password=password)
                auth.login(request, user_login)

                user_model = User.objects.get(username=username)
                new_profile = Profile.objects.create(user=user_model, id_user=user_model.id)
                new_profile.save()
                return redirect('settings')
        else:
            messages.info(request, 'Password not matching')
            return redirect('signup/')
    else:
        return render(request, 'auth/signup.html')
    
def sigin(request):

    if (request.method == 'POST'):
        username = request.POST['username']
        password = request.POST['password']

        user = auth.authenticate(username=username, password=password)

        if user is not None:
            auth.login(request, user)
            return redirect('/')
        else:
            messages.info(request, 'Invalid credentials')
            return redirect('signin')
    else:
        return render(request, 'auth/signin.html')

@login_required(login_url='signin')
def logout(request):
    auth.logout(request)
    return redirect('signin')

@login_required(login_url='signin')
def settings(request):
    user_profile = Profile.objects.get(user=request.user)

    if request.method == 'POST':

        if request.FILES.get('image') == None:
            image = user_profile.profileImg
            bio = request.POST['bio']

            user_profile.profileImg = image
            user_profile.bio = bio
            user_profile.save()

        if request.FILES.get('image') != None:
            image = request.FILES.get('image')
            bio = request.POST['bio']

            user_profile.profileImg = image
            user_profile.bio = bio
            user_profile.save()

        return redirect('settings')
    return render(request, 'core/settings.html', {'user_profile': user_profile})

@login_required(login_url='signin')
def search_and_send_friend_request(request):
    search_query = request.GET.get('search_query', '')
    users = []

    if search_query:
        users = User.objects.filter(username__icontains=search_query)

    if request.method == 'POST':
        to_user_id = request.POST.get('to_user_id', None)

        if to_user_id:
            to_user = get_object_or_404(User, id=to_user_id)

            existing_request = FriendRequest.objects.filter(from_user=request.user, to_user=to_user).first()
            if not existing_request:
                FriendRequest.objects.create(from_user=request.user, to_user=to_user)

            return redirect('/friends/')

    return render(request, 'friends/search.html', {'users': users, 'search_query': search_query})

@login_required(login_url='signin')
def view_friends(request):
    friends = Friendship.objects.filter(user1=request.user) | Friendship.objects.filter(user2=request.user)

    received_requests = FriendRequest.objects.filter(to_user=request.user, accepted=False)

    if request.method == 'POST':
        friend_id = request.POST.get('friend_id', None)
        action = request.POST.get('action', None)

        if friend_id and action:
            friend = get_object_or_404(User, id=friend_id)

            if action == 'remove':
                Friendship.objects.filter(Q(user1=request.user, user2=friend) | Q(user1=friend, user2=request.user)).delete()
            elif action == 'accept':
                friend_request = get_object_or_404(FriendRequest, from_user=friend, to_user=request.user, accepted=False)
                Friendship.objects.create(user1=request.user, user2=friend)
                friend_request.delete()
            elif action == 'reject':
                friend_request = get_object_or_404(FriendRequest, from_user=friend, to_user=request.user, accepted=False)
                friend_request.delete()

            return redirect('/friends/')

    return render(request, 'friends/home.html', {'friends': friends, 'received_requests': received_requests})