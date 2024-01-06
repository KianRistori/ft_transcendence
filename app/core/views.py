import requests
from django.shortcuts import render, redirect, get_object_or_404, HttpResponseRedirect
from django.core.files import File
from tempfile import NamedTemporaryFile
from django.contrib.auth.models import User, auth
from django.db.models import Q
from django.contrib import messages
from .models import Profile, Friendship, FriendRequest, MatchHistory
from django.contrib.auth.decorators import login_required
from django.conf import settings

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
    
def login_with_42(request):
    # Costruisci il link di autorizzazione con il tuo client_id e redirect_uri
    full_authorize_url = f'{settings.SOCIAL_AUTH_42_FULL_URL[0]}'

    # Reindirizza l'utente alla schermata di autorizzazione di 42
    return HttpResponseRedirect(full_authorize_url)

def auth_complete(request):
    print(request.GET)
    # Codice di autorizzazione ottenuto dal redirect URL
    code = request.GET.get('code')

    # Configura i dettagli dell'applicazione 42
    client_id = settings.SOCIAL_AUTH_42_KEY[0]
    client_secret = settings.SOCIAL_AUTH_42_SECRET[0]
    redirect_uri = settings.SOCIAL_AUTH_42_REDIRECT_URI[0]
    token_url = settings.SOCIAL_AUTH_42_TOKEN_URL[0]

    # Scambia il codice di autorizzazione con il token di accesso
    response = requests.post(
        token_url,
        data={
            'grant_type': 'authorization_code',
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uri,
        },
    )

    # Se la richiesta è andata a buon fine, ottieni il token di accesso
    if response.status_code == 200:
        access_token = response.json().get('access_token')

        # Ottieni i dettagli dell'utente da 42 utilizzando il token di accesso
        user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': f'Bearer {access_token}'})
        user_info = user_info_response.json()
        # Esempio: Aggiungi o aggiorna l'utente nel tuo database
        user, created = User.objects.get_or_create(username=user_info['login'], defaults={'email': user_info.get('email', '')})
        user.save()
        auth.login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        if created:
            user_model = User.objects.get(username=user_info['login'])
            new_profile = Profile.objects.create(user=user_model, id_user=user_model.id)
            profile_image_url = user_info['image']['link']
            img_temp = NamedTemporaryFile(delete=True)
            img_temp.write(requests.get(profile_image_url).content)
            img_temp.flush()
            new_profile.profileImg.save(f'{user_model.username}_profile_img.jpg', File(img_temp))
            new_profile.save()
        return redirect('settings')  # Sostituisci 'home' con il tuo URL home effettivo

    # Gestionare il caso in cui la richiesta non è andata a buon fine
    return redirect('signin')  # Sostituisci 'login' con il tuo URL di login

@login_required(login_url='signin')
def logout(request):
    auth.logout(request)
    return redirect('signin')

@login_required(login_url='signin')
def settingsHome(request):
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

@login_required(login_url='signin')
def profile_page(request, id_user):
    profile = Profile.objects.get(id_user=id_user)
    match_history = MatchHistory.objects.filter(Q(profile_winner=profile) | Q(profile_loser=profile)).order_by('-match_date')
    return render(request, 'profile/home.html', {'profile': profile, 'match_history': match_history})

@login_required(login_url='signin')
def my_profile_page(request):
    profile = Profile.objects.get(user=request.user)
    match_history = MatchHistory.objects.filter(Q(profile_winner=profile) | Q(profile_loser=profile)).order_by('-match_date')
    return render(request, 'profile/myhome.html', {'profile': profile, 'match_history': match_history})