import { User } from "./modules/users/models/User.model";

declare global {
  namespace Express {
    interface Request {
      user: User | undefined;
    }
  }
}
