import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
# from channels import Group

class PongConsumer(AsyncJsonWebsocketConsumer):
    user_count = {}

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = 'room_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Incrementa il conteggio degli utenti per questo gruppo
        if self.room_group_name in self.user_count:
            self.user_count[self.room_group_name] += 1
        else:
            self.user_count[self.room_group_name] = 1

        # print(self.user_count[self.room_group_name])

        if self.user_count[self.room_group_name] == 2:
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
        if event == 'MOVE':
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                'message': message,
                "event": "MOVE"
            })

        if event == 'START':
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                'message': message,
                'event': "START"
            })

        if event == 'END':
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_message',
                'message': message,
                'event': "END"
            })

    async def send_message(self, res):
        """ Receive message from room group """
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "payload": res,
        }))