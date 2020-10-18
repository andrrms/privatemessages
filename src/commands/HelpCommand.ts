import { parsePayload } from '../utils/util';
import { UserServices } from '../database/services';
import { TContextWithState } from '../utils/interfaces';

const service = new UserServices();

export default async function HelpCommand(ctx: TContextWithState) {
  if (ctx.message && ctx.message.from && ctx.message.text) {
    const { method } = parsePayload(ctx.message.text.substr(6));

    if (method && method !== process.env.BOT_USERNAME) {
      switch (method) {
        case 'header':
          return ctx.reply(ctx.i18n.t('commands.help.header'), {
            parse_mode: 'HTML'
          });
        default:
          break;
      }
    } else {
      ctx.reply(ctx.i18n.t('commands.help.standard'), {
        parse_mode: 'HTML'
      })
    }
  }
}