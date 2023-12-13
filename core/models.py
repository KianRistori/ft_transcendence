from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.
class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    id_user = models.IntegerField()
    bio = models.TextField(blank=True)
    profileImg = models.ImageField(upload_to='profile_images', default='default_profile_picture.jpg')

    def __str__(self):
        return self.user.username
    
class MatchHistory(models.Model):
    profile_winner = models.ForeignKey(Profile, related_name='matches_won', on_delete=models.CASCADE)
    profile_loser = models.ForeignKey(Profile, related_name='matches_lost', on_delete=models.CASCADE)
    score_winner = models.IntegerField()
    score_loser = models.IntegerField()
    match_date = models.DateTimeField(auto_now_add=True)
    
class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='friend_requests_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='friend_requests_received', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)

class Friendship(models.Model):
    user1 = models.ForeignKey(User, related_name='friends', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, on_delete=models.CASCADE)

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)