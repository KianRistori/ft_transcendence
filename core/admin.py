from django.contrib import admin
from .models import Profile, MatchHistory, FriendRequest, Friendship, Message

# Register your models here.
admin.site.register(Profile)
admin.site.register(MatchHistory)
admin.site.register(FriendRequest)
admin.site.register(Friendship)
admin.site.register(Message)