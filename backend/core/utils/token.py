from django.utils import timezone
import jwt


class Token:
    def __init__(self) -> None:
        self.key = "Fw1SEF2a2eAF323RA3SDFa321s3FR"

    def access_token(self, user, expires=5):
        return jwt.encode(
            {
                "user_id": user.pk,
                "exp": timezone.now() + timezone.timedelta(minutes=expires),
            },
            self.key,
            algorithm="HS256",
        )

    def refresh_token(self, user, expires=30):
        return jwt.encode(
            {
                "user_id": user.pk,
                "exp": timezone.now() + timezone.timedelta(days=expires),
            },
            self.key,
            algorithm="HS256",
        )

    def verify_token(self, token):
        try:
            data = jwt.decode(token, self.key, algorithms=["HS256"])
            return data["exp"] > timezone.now()
        except:
            return False
