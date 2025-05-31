from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model



User = get_user_model()



class EmergencyType(models.TextChoices):
    DANGER_ALERT = "D", "Danger Alert"
    OFFER_HELP = "O", "Offer Help"
    MEDICAL_HELP = "M", "Medical Help"


class Emergency(models.Model):
    emergency_type = models.CharField(
        max_length=1,
        choices=EmergencyType.choices,
        default=EmergencyType.OFFER_HELP,
    )
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=1)
    location = models.CharField(max_length=300)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    class Meta:
        ordering = ['-created_at']


class EmergencyImage(models.Model):
    emergency = models.ForeignKey(
        Emergency, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(
        upload_to='emergency/images',
        )
    def save(self, *args, **kwargs):
        if EmergencyImage.objects.filter(emergency=self.emergency).count() >= 5:
            raise ValidationError("Cannot upload more than 5 images for this emergency.")
        super().save(*args, **kwargs)
