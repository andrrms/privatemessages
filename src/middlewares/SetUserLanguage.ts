import { TContextWithState } from '../utils/interfaces';
import { UserServices } from '../database/services';

const service = new UserServices();

export default async function UserIsBanned(ctx: TContextWithState, next: CallableFunction) {
  if (ctx.from) {
    const user = await service.getUserLanguage(ctx.from.id);

    if (user.response) {
      ctx.i18n.locale(user.payload);
    }
  }

  next();
}