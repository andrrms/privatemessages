import { TContextWithState } from '../utils/interfaces';
import { MessageServices } from '../database/services';

const service = new MessageServices();

export default async function ChosenResultListener(ctx: TContextWithState) {
  if (ctx.chosenInlineResult) {
    const [_, method, payload] = ctx.chosenInlineResult.result_id.match(/([a-zA-Z]+)_([a-zA-Z0-9].+)/)!;

    if (method === 'sellMsg') {
      const [value, ucid] = payload.split('_');

      if (parseInt(value) !== 0) {
        service.registerNewMessage({
          from_user_id: ctx.chosenInlineResult.from.id,
          message: escape(ctx.chosenInlineResult.query),
          value: parseInt(value),
          unique_callback_id: ucid,
        });
      }
    }
  }
}