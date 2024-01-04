from .models import Profile

def user_context(request):
    if request.user.is_authenticated:
        if not request.path.startswith('/admin/'):
            user_profile = Profile.objects.get(user=request.user)
            return {'user_profile': user_profile}
    return {}