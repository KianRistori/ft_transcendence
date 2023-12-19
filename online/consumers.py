import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from core.models import MatchHistory, Profile
from channels.db import database_sync_to_async

class PongConsumer(AsyncJsonWebsocketConsumer):
    user_count = {}
    usernames = {}
    users_id = {}
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = 'room_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        if self.room_group_name not in self.usernames:
            self.usernames[self.room_group_name] = []
        
        if self.room_group_name not in self.users_id:
            self.users_id[self.room_group_name] = []

        self.usernames[self.room_group_name].append(self.scope['user'].username)
        self.users_id[self.room_group_name].append(self.scope['user'].id)

        # Incrementa il conteggio degli utenti per questo gruppo
        if self.room_group_name in self.user_count:
            self.user_count[self.room_group_name] += 1
        else:
            self.user_count[self.room_group_name] = 1

        # print(self.user_count[self.room_group_name])
        if self.user_count[self.room_group_name] == 1:
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                "event": "HOST"
            })
        
        if self.user_count[self.room_group_name] == 2:
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                "event": "VS_HEADING",
                'message': self.usernames[self.room_group_name][0] + " VS " + self.usernames[self.room_group_name][1]
            })
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                "event": "STARTGAME"
            })
        
        await self.accept()

    async def disconnect(self, close_code):
        print("Disconnected")
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        # Decrementa il conteggio degli utenti per questo gruppo
        self.user_count[self.room_group_name] -= 1

    async def receive(self, text_data):
        """
        Receive message from WebSocket.
        Get the event and send the appropriate event
        """
        response = json.loads(text_data)
        event = response.get("event", None)
        message = response.get("message", None)
        ballX = response.get("ballX", None)
        ballY = response.get("ballY", None)

        if event == 'START':
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                'message': message,
                'event': "START"
            })

        if event == 'END':
            # Send message to room group
            if message == "PLAYER1":
                winner_username = self.usernames[self.room_group_name][0]
                loser_username = self.usernames[self.room_group_name][1]
                score_winner = response.get("scorePlayer1", None)
                score_loser = response.get("scorePlayer2", None)

                winner_profile = await database_sync_to_async(Profile.objects.get)(user__username=winner_username)
                loser_profile = await database_sync_to_async(Profile.objects.get)(user__username=loser_username)

                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'send_message',
                    'message': self.usernames[self.room_group_name][0] + " WINS!",
                    'event': "END"
                })
                await database_sync_to_async(MatchHistory.objects.create)(
                    profile_winner=winner_profile,
                    profile_loser=loser_profile,
                    score_winner=score_winner,
                    score_loser=score_loser,
                )
            else:
                winner_username = self.usernames[self.room_group_name][1]
                loser_username = self.usernames[self.room_group_name][0]
                winner_profile = await database_sync_to_async(Profile.objects.get)(user__username=winner_username)
                loser_profile = await database_sync_to_async(Profile.objects.get)(user__username=loser_username)
                score_winner = response.get("scorePlayer2", None)
                score_loser = response.get("scorePlayer1", None)
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'send_message',
                    'message': self.usernames[self.room_group_name][1] + " WINS!",
                    'event': "END"
                })
                await database_sync_to_async(MatchHistory.objects.create)(
                    profile_winner=winner_profile,
                    profile_loser=loser_profile,
                    score_winner=score_winner,
                    score_loser=score_loser,
                )
        
        if event == 'MOVE_PLAYER1':
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                'message': message,
                'event': "MOVE_PLAYER1"
            })

        if event == 'MOVE_PLAYER2': 
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                'message': message,
                'event': "MOVE_PLAYER2"
            })
        
        if event == 'BALL_MOVE': 
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                'event': "BALL_MOVE",
                'ballX': ballX,
                'ballY': ballY
            })

        if event == 'BALL_RESET': 
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                'event': "BALL_RESET",
                'ballX': ballX,
                'ballY': ballY
            })
        
        if event == 'SCORE_PLAYER1':
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                'event': "SCORE_PLAYER1",
                'message': message,
            })

        if event == 'SCORE_PLAYER2':
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                'event': "SCORE_PLAYER2",
                'message': message,
            })

    async def send_message(self, res):
        """ Receive message from room group """
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "payload": res,
        }))