import { User } from "../../modules/auth/entities/user.entity";

declare global {
  namespace Express {
    interface Request {
      user: User | undefined;
    }
  }
}
