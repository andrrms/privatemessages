import { BaseScene } from 'telegraf';
import { TContextWithState, IJWTData } from '../../utils/interfaces';
import { UserServices } from '../../database/services';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const service = new UserServices();

export const RestoreCommandScene = new BaseScene<TContextWithState>('restore');

RestoreCommandScene.enter((ctx) => {
  if (ctx.message && ctx.message.from) {
    if (ctx.state.chat_is_private) {
      ctx.reply(ctx.i18n.t('commands.restore.body'),
        {
          reply_to_message_id: ctx.message.message_id,
          parse_mode: 'HTML'
        }
      );
    } else {
      ctx.reply(ctx.i18n.t('common.message_on_private', { username: process.env.BOT_USERNAME }),
        { reply_to_message_id: ctx.message.message_id, parse_mode: 'HTML' });
      ctx.scene.leave();
    }
  }
});

RestoreCommandScene.on('message', async (ctx) => {
  if (ctx.message && ctx.message.text && ctx.message.from) {
    const token = ctx.message.text;
    const userId = ctx.message.from.id;
    const secret = process.env.JWT_SECRET!;

    JWT.verify(token, secret, async (err, decoded) => {
      if (err) {
        console.log(err);
        ctx.reply(ctx.i18n.t('commands.restore.invalid_key'));
        return ctx.scene.leave();
      }

      const { user_id, sell_msg, coins, is_admin } = decoded as IJWTData;

      const hasUser = await service.userExists(user_id);

      if (hasUser.payload && user_id === userId) {
        const merge = await service.mergeData(user_id, {
          coins,
          is_admin,
          sell_msg
        });

        if (merge.response) {
          ctx.reply(ctx.i18n.t('commands.restore.success'));
          return ctx.scene.leave();
        } else {
          ctx.reply(ctx.i18n.t('commands.restore.error'));
          return ctx.scene.leave();
        }
      } else {
        ctx.reply(ctx.i18n.t('commands.restore.different_key'));
        return ctx.scene.leave();
      }
    });
  }
});