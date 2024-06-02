import * as bcrypt from 'bcrypt';
export const hashData = (data: string, salt: number) => {
  return bcrypt.hashSync(data, salt);
};