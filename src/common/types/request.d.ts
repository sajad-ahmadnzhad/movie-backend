import { User } from "../modules/auth/entities/User.entity";

declare global {
  namespace Express {
    interface Request {
      user: User | undefined;
    }
  }
}
