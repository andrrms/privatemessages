import { BaseScene } from 'telegraf';
import { TContextWithState, IJWTData } from '../../utils/interfaces';
import { UserServices } from '../../database/services';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';

const service = new UserServices();

export const RestoreCommandScene = new BaseScene<TContextWithState>('restore');

RestoreCommandScene.enter((ctx) => {
  if (ctx.message && ctx.message.from) {
    if (ctx.state.chat_is_private) {
      ctx.reply(
        'ℹ Restauração de conta\n\n' +
        'Responda essa mensagem com a sua chave de backup para realizar a restauração\\.\n' +
        '_Para cancelar a restauração, use o comando /cancel_',
        {
          reply_to_message_id: ctx.message.message_id,
          parse_mode: 'MarkdownV2'
        }
      );
    } else {
      ctx.reply('Você só pode restaurar sua conta no chat privado comigo.',
        { reply_to_message_id: ctx.message.message_id });
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
        ctx.reply('Não foi possível restaurar sua conta pois sua chave está inválida.');
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
          ctx.reply('Sua conta foi restaurada com sucesso!');
          return ctx.scene.leave();
        } else {
          ctx.reply('Não foi possível restaurar sua conta. Contate @andrrms para informar esse erro.');
          return ctx.scene.leave();
        }
      } else {
        ctx.reply('Não foi possível restaurar sua conta pois essa chave não pertence à você.');
        return ctx.scene.leave();
      }
    });
  }
});