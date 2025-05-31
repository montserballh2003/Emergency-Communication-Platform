from drf_spectacular.utils import extend_schema, OpenApiParameter, inline_serializer,OpenApiExample
from rest_framework import serializers

# Documentation for `CustomProviderAuthView` - GET for Authorization URL
custom_provider_auth_view_get_schema = extend_schema(
    description="This Endpoint returns an `authorization_url` for signing in with Google, redirecting with `state` and `code` parameters.",
    parameters=[
        OpenApiParameter(
            name="redirect_uri",
            description="The redirect URI for the OAuth flow.",
            type=str,
            required=True,
        ),
        OpenApiParameter(
                name="provider",
                description="The OAuth provider. Available options: `google`",
                type=str,
                required=True,
                enum=["google-oauth2"],  # Define choices for the `provider`
                location=OpenApiParameter.PATH,  # Specify that it's a path parameter
            ),
    ],
    responses={
        200: inline_serializer(
            name="AuthorizationResponse",
            fields={
                "authorization_url": serializers.CharField(
                    help_text="Generated Google OAuth authorization URL."
                )
            },
        )
    },
)

# Documentation for `CustomProviderAuthView` - GET for Access and Refresh Token
custom_provider_auth_view_post_schema = extend_schema(
    description="This Endpoint requires `state` and `code` parameters and returns an access and refresh token.",
    parameters=[
        OpenApiParameter(
            name="state",
            type=str,
            required=True,
            description="State parameter returned from the OAuth provider.",
        ),
        OpenApiParameter(
            name="code",
            type=str,
            required=True,
            description="Authorization code returned from the OAuth provider.",
        ),
        OpenApiParameter(
                name="provider",
                description="The OAuth provider. Available options: `google`",
                type=str,
                required=True,
                enum=["google-oauth2"],  # Define choices for the `provider`
                location=OpenApiParameter.PATH,  # Specify that it's a path parameter
            ),
    ],
    responses={
            201: inline_serializer(
                name="TokenResponse",
                fields={
                    "access": serializers.CharField(
                        help_text="Access token for the user."
                    ),
                    "refresh": serializers.CharField(
                        help_text="Refresh token for the user."
                    ),
                    "user": serializers.EmailField(
                        help_text="Email address of the authenticated user."
                    ),
                },
            )
        }
)

sent_email_schema= extend_schema(
    description= "The code that sent, it'll expire after 1 hour.",
    parameters=[
        OpenApiParameter(
            name="redirect_url",
            description="The URL to redirect to after sending the email. \n format should be like `http://example.com/callback` and it will send the link like `http://example.com/callback?code=123456`",
            type=str,
            required=True,
        ),
    ],
    responses={
            201: inline_serializer(
                name="good request",
                fields={
                    "message": serializers.CharField(
                        default="code sent successfully."
                    )
                },
            ),
            400:inline_serializer(
                name = "bad request",
                fields={
                    "message": serializers.CharField(
                        default="This email is not exist."
                    )
                },
            )
        }
)

confirm_reset = extend_schema(
    description="that's endpoint returns `400` bad request if there any bad request ",
    responses={
            201: inline_serializer(
                name="good request",
                fields={
                    "message": serializers.CharField(
                        default="password change successfully."
                    )
                },
            ),

            }
)