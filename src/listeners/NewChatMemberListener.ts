import { TContextWithState } from '../utils/interfaces';
import { GroupServices } from '../database/services';

const service = new GroupServices();

export default async function NewChatMemberListener(ctx: TContextWithState) {
  if (ctx.message && ctx.message.new_chat_members) {
    const find = ctx.message.new_chat_members.find(user => user.is_bot && user.username === process.env.BOT_USERNAME);

    if (find) {
      const membersCount = await ctx.getChatMembersCount();

      if (membersCount > 25) {
        ctx.reply(
          'Bot configurado com sucesso. ' +
          'Para começar usar, inicie uma conversa comigo.\n\n' +
          'Este grupo está habilitado para usar o Pole Canaria.'
        );
      } else {
        ctx.reply(
          'Bot configurado com sucesso. ' +
          'Para começar usar, inicie uma conversa comigo.\n\n' +
          'Este grupo não está habilitado para usar o Pole Canaria.'
        );
      }
    }
  }
}