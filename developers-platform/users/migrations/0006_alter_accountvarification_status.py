# Generated by Django 5.1.3 on 2024-11-24 13:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_rename_user_accountvarification_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='accountvarification',
            name='status',
            field=models.BooleanField(default=False),
        ),
    ]
