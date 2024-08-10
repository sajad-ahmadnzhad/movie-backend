import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { Profile } from "passport";

@Injectable()
export class Oauth2Strategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      scope: ["profile", "email"],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) {
    if (!profile.emails?.length) return done(null);

    const user = {
      name: profile.displayName,
      username: profile.emails?.[0].value.split("@")[0],
      email: profile.emails?.[0].value,
      avatarURL: profile.photos?.[0].value,
      isVerifyEmail: true,
    };

    done(null, user);
  }
}
