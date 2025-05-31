from drf_spectacular.utils import extend_schema, OpenApiParameter, inline_serializer,OpenApiExample
from rest_framework import serializers
from .serializers import MessageSerializer
from drf_spectacular_websocket.decorators import extend_ws_schema

Custom_admin_consumer = extend_ws_schema(
    description="This Endpoint is protected . \n you have to send a `jwt` as a `parameter` in the url like : \n `ws://chat/<str:chat_name>/?token=<your_jwt_token>`",
    type='send',
    summary='sending message',
        request=inline_serializer(
        name='ChatMessageRequest',
        fields={
            'message': serializers.CharField(),
        },
    ),
    responses={
        200: inline_serializer(
            name='ChatMessageResponse',
        
            fields={
                'message': serializers.CharField(),
                'user': serializers.CharField(),
            },
        ),
    },
    examples=[
        OpenApiExample(
            'Example 1',
            summary='Example of sending a message',
            value={
                'message': 'Hello, world!',
            },
            request_only=True,
            response_only=False,
        ),
    ],
)

custom_chat_list_schema = extend_schema(
    description="This Endpoint is protected . \n you should be an `admin`",
)



custom_chat_messages_list_schema = extend_schema(
    description="This Endpoint is protected , <br> You should be A `user`",
    responses=MessageSerializer
)

