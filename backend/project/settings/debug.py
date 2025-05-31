from .common import *


SECRET_KEY = 'django-insecure-4t2dackh(4f_*t$%3^pyt^ym1!f!sl1n8y3quop(@(ey9q*%i)'



DEBUG = True


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}