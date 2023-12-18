from django.http import Http404
from django.shortcuts import redirect, render
from django.contrib.auth.decorators import login_required

@login_required(login_url='signin')
def home(request):
    if request.method == "POST":
        room_code = request.POST.get("room_code")
        char_choice = request.POST.get("character_choice")
        return redirect(
            'play/%s?&choice=%s' 
            %(room_code, char_choice)
        )
    return render(request, "online/home.html")

def game(request, room_code):
    choice = request.GET.get("choice")
    if choice not in ['Player 1', 'Player 2']:
        raise Http404("Choice does not exists")
    context = {
        "char_choice": choice, 
        "room_code": room_code
    }
    return render(request, "online/game.html", context)