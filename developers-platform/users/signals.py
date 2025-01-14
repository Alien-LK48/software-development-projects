from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from django.contrib.auth.models import User
from.models import Profile, AccountVarification

from django.core.mail import send_mail
from django.conf import settings

# @receiver(post_save, sender=Profile)

def createProfile(sender, instance, created, **kwargs):
    if created:
        user = instance
        profile = Profile.objects.create(
            user=user,
            username=user.username,
            email=user.email,
            name=user.first_name,
        )

        subject = 'Welcome to DevSearch'
        message = f"Hello Sir/Madam,\n\nYou are successfully register a account.\n\nPlease verify you account with in 7 dayes.\n\nTeam: Syntax Error."

        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [profile.email],
            fail_silently=False,
        )

@receiver(post_save, sender=AccountVarification)
def send_verification_email(sender, instance, **kwargs):
    if instance.status and not kwargs.get('created', False):
        subject = "Account Verified"
        message = f"Hello {instance.user.username},\n\nYour account has been successfully verified.\n\nThank you for using our platform!"
        recipient_list = [instance.user.email]
        send_mail(
            subject,
            message,
            None,  # Uses DEFAULT_FROM_EMAIL from settings
            recipient_list,
            fail_silently=False,
        )


def updateUser(sender, instance, created, **kwargs):
    profile = instance
    user = profile.user
    if created == False:
        user.first_name = profile.name
        user.username = profile.username
        user.email = profile.email
        user.save()

def deleteUser(sender, instance, **kwargs):
    try:
        user = instance.user
        user.delete()
    except Exception as e:
        print(f"Error deleting user: {e}")

    

post_save.connect(createProfile, sender=User)
post_delete.connect(updateUser, sender=Profile)
post_delete.connect(deleteUser, sender=Profile)
