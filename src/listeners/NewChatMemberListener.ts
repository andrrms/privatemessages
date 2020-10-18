import { TContextWithState } from '../utils/interfaces';
import { GroupServices } from '../database/services';

const service = new GroupServices();

export default async function NewChatMemberListener(ctx: TContextWithState) {
  if (ctx.message && ctx.message.new_chat_members) {
    const find = ctx.message.new_chat_members.find(user => user.is_bot && user.username === process.env.BOT_USERNAME);

    if (find) {
      const membersCount = await ctx.getChatMembersCount();

      if (membersCount > 25) {
        ctx.reply(ctx.i18n.t('system.new_member.welcome_message.group_enabled'));
      } else {
        ctx.reply(ctx.i18n.t('system.new_member.welcome_message.group_disabled'));
      }
    }
  }
}