from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers


emergency_create_schema = extend_schema(
    description="Create a new Emergency record. Authentication required.",
    request=inline_serializer(
        name="CreateEmergencyRequest",
        fields={
            "emergency_type": serializers.ChoiceField(
                choices=["D", "O", "M"],
                help_text="Type of emergency. Options: D = Danger Alert, O = Offer Help, M = Medical Help."
            ),
            "description": serializers.CharField(help_text="Details about the emergency."),
            'location': serializers.CharField(),

            "images": serializers.ListField(
                child=serializers.FileField(),
                required=False,
                help_text="Optional. Up to 5 images. Each must be a valid file."
            ),
        }
    ),
    responses={
        201: inline_serializer(
            name="CreateEmergencyResponse",
            fields={
                "id": serializers.IntegerField(),
                "emergency_type": serializers.CharField(),
                "description": serializers.CharField(),
                "created_at": serializers.DateTimeField(),
                'location': serializers.CharField(),
                "images": serializers.ListField(
                    child=inline_serializer(
                        name="CreatedEmergencyImageItem",
                        fields={
                            "id": serializers.IntegerField(),
                            "image": serializers.URLField(),
                        }
                    ),
                    help_text="The uploaded images for this new Emergency."
                ),
            }
        )
    }
)
