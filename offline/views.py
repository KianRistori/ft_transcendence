from django.shortcuts import render

# Create your views here.
def home(request):
    return render(request, 'home.html')

def home1vs1(request):
    return render(request, '1vs1/home.html')

def homeAI(request):
    return render(request, 'ai/home.html')

def homeTournament(request):
    return render(request, 'tournament/home.html')
