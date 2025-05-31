from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.cache import cache
from django.core.mail import send_mail
import random
from .platforms import GoogleAuth, generate_tokens_for_user



User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=1, required=1)
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'password2',"first_name","last_name"]
        extra_kwargs = {'password': {'write_only': True}}

    def validate_password(self, value):
        try:
            validate_password(value)
        except Exception as e:
            raise serializers.ValidationError(e)
        return value

    def validate(self, attrs):
        password2 = attrs.pop("password2")

        if attrs['password'] != password2:
            raise serializers.ValidationError({
                'password2': "The passwords do not match. Please make sure both fields contain the same password."
            })
        return super().validate(attrs)


    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
        
    
    def to_representation(self, instance):
        refresh = RefreshToken.for_user(instance)
        access = refresh.access_token
        user_representation = super().to_representation(instance)
        return {
            "user": user_representation,
            "access": str(access),
            "refresh": str(refresh),
        }




class MeSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=1)
    is_admin = serializers.BooleanField(read_only=1)
    class Meta:
        model = User
        fields = ['id','email','first_name','last_name','is_admin']


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(style={"input_type": "password"})
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    default_error_messages = {
        "invalid_password": "password is incorrect.",
        'not match': "passwords does not match.",
        'old one' : "your new password can't the same as your old one.",

    }

    def validate_current_password(self, value):
        self.request = self.context["request"]
        if is_password_valid := self.request.user.check_password(value):
            return value
        else:
            self.fail("invalid_password")
        
    def validate(self, attrs):
        password =attrs['password']
        if password != attrs["password2"]:
            self.fail('not match')
        
        #see if the new password the same as old one 
        if password == attrs['current_password']:
            self.fail('old one')
            
        # check if password complex enough
        try:
            validate_password(password)
        except Exception as e:
            raise serializers.ValidationError(e)
        
        
        return super().validate(attrs)

    def save(self):
        """
        Update the user's password after validation.
        """
        user = self.request.user
        user.set_password(self.validated_data["password"])
        user.save()
        return user




class basePasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


    def validate_email(self, value):
        user = User.objects.filter(email = value).exists()
        print(user)
        if user:
            return value
        else :
            raise serializers.ValidationError("This email is not exist.")

class PasswordResetRequestSerializer(basePasswordResetSerializer):
    
        
    def save(self):
        email = self.validated_data['email']
        code = cache.get(email)
        redirect_url = self.context.get('redirect_url')

        if not code:
            code = f"{random.randint(100000, 999999)}"
            cache.set(email, code, timeout=3600)
            
        send_mail(
            subject="Password Reset Code",
            message=f"You can reset your password throught this link:\n {redirect_url}?code={code}&email={email} \nIf you did not make this request then please ignore this email.",
            from_email=None,  # Uses DEFAULT_FROM_EMAIL in settings.py
            recipient_list=[email],
        )

    def to_representation(self, instance):
        return {"message":"code sent successfully."}
    

class PasswordResetCodeSerializer(basePasswordResetSerializer):
    code = serializers.CharField()
    new_password = serializers.CharField()
    
    def validate_new_password(self, value):
        try:
            validate_password(value)
        except Exception as e:
            raise serializers.ValidationError(e) from e
        return value
    
    def validate_email(self, value):
        super().validate_email(value)
        if cache.get(value):
            return value
        raise serializers.ValidationError("There is no code sent to this email")

    def save(self, **kwargs):
        code = self.validated_data["code"] 
        email = self.validated_data['email']
        password =  self.validated_data['new_password']
        if code != cache.get(email):
            raise serializers.ValidationError("this code is incorrect")
        user = User.objects.get(email=email)
        if user.check_password(password):
            raise serializers.ValidationError("This is an old password")
        user.set_password(password)
        user.save()
        cache.delete(email)
        return user

    def to_representation(self, instance):
        return {"message": "password change successfully."}
    
    


class GoogleCodeSerializer (serializers.Serializer) : 
    code = serializers.CharField()
    __google_auth = GoogleAuth()
    
    def create(self, validated_data):
        code = validated_data.get('code')
        user = self.__google_auth.get_user_info_by_code(code)
        return self.__google_auth.save_user_data(user_dict=user)
    
    def to_representation(self, instance):
        return generate_tokens_for_user(instance)
