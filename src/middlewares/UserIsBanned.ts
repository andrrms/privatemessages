import { TContextWithState } from '../utils/interfaces';
import { UserServices } from '../database/services';

const service = new UserServices();

export default async function UserIsBanned(ctx: TContextWithState, next: CallableFunction) {
  if (ctx.from) {
    const userExists = await service.userExists(ctx.from.id);

    if (userExists.response && userExists.payload) {
      const isBanned = await service.userIsBanned(ctx.from.id);

      if (isBanned.response && !isBanned.payload) {
        next();
      }
    } else {
      next();
    }
  }
}