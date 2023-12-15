import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class PongConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print(text_data)
        message_type = text_data_json['type']

        if message_type == 'invitation':
            sender = text_data_json['sender']
            opponent = text_data_json['opponent']
            print("lello")
            # Send an invitation message to the opponent
            # You might include additional data in the invitation message
            self.send(text_data=json.dumps({
                'type': 'invitation_received',
                'message': f'You received an invitation from {sender}. Do you accept?',
                'sender': sender,
                'opponent': opponent
            }))

        elif message_type == 'accept_invitation':
            # The opponent has accepted the invitation
            opponent = text_data_json['opponent']
            channel_name = self.get_or_create_channel_name(self.scope['user'].username, opponent)
            print(channel_name)
            # Add both users to the same channel group
            async_to_sync(self.channel_layer.group_add)(channel_name, self.channel_name)

            # Notify both users that they have joined the same group
            async_to_sync(self.channel_layer.group_send)(
                channel_name,
                {
                    'type': 'opponent_joined_group',
                    'message': f'{opponent} has joined the group.',
                    'user': self.scope['user'].username
                }
            )

    def opponent_joined_group(self, event):
        message = event['message']
        username = event['user']

        # Send a message to the current user that the opponent has joined the group
        self.send(text_data=json.dumps({
            'type': 'opponent_joined_group',
            'message': message,
            'user': username
        }))

    def opponent_paddle(self, event):
        message = event['message']
        username = event['user']

        self.send(text_data=json.dumps({
            'type':'opponent_paddle',
            'message':message,
            'user':username
        }))

    def get_or_create_channel_name(self, username, opponent_username):
        # Generate a unique channel name based on user identifiers
        # You might use a specific pattern or concatenation to create a unique name
        # For example:
        print("gattoide")
        if (username <= opponent_username):
            return f"user_channel_{username}_{opponent_username}"
        else:
            return f"user_channel_{opponent_username}_{username}"
            