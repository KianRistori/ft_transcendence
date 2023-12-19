from django.shortcuts import redirect, render
from django.contrib.auth.decorators import login_required
import secrets

@login_required(login_url='signin')
def home(request):
    if request.method == "POST":
        room_code = request.POST.get("room_code")
        create_new = request.POST.get("create_new")

        if create_new == "true":
            room_code = secrets.token_hex(3)

        return redirect(
            'play/%s' 
            %(room_code)
        )
    return render(request, "online/home.html")

def game(request, room_code):
    context = {
        "room_code": room_code,
    }
    return render(request, "online/game.html", context)