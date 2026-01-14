from django.db import migrations, models
import django.utils.timezone
from django.conf import settings


def copy_user_to_fields(apps, schema_editor):
    Booking = apps.get_model('bookings', 'Booking')
    User = apps.get_model(settings.AUTH_USER_MODEL.split('.')[0], settings.AUTH_USER_MODEL.split('.')[1])
    for b in Booking.objects.all():
        if getattr(b, 'user_id', None):
            try:
                user = User.objects.get(pk=b.user_id)
                b.user_name = user.get_full_name() or user.username
                b.user_email = user.email
                b.save()
            except Exception:
                # best-effort, don't fail migration
                continue


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0001_initial'),
    ]

    operations = [
        # Add guest fields
        migrations.AddField(
            model_name='booking',
            name='user_name',
            field=models.CharField(max_length=150, null=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='user_email',
            field=models.EmailField(max_length=254, null=True, db_index=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='user_phone',
            field=models.CharField(max_length=30, null=True),
        ),
        # Copy existing user info into new fields (best-effort)
        migrations.RunPython(copy_user_to_fields, reverse_code=migrations.RunPython.noop),
        # Remove the old user foreign key (we intentionally remove it to decouple bookings from Django users)
        migrations.RemoveField(
            model_name='booking',
            name='user',
        ),
        # Create OTPRequest model
        migrations.CreateModel(
            name='OTPRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254, db_index=True)),
                ('otp_hash', models.CharField(max_length=128)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField()),
                ('used', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='EmailSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(max_length=64, unique=True)),
                ('email', models.EmailField(max_length=254, db_index=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField()),
                ('valid', models.BooleanField(default=True)),
            ],
        ),
    ]
