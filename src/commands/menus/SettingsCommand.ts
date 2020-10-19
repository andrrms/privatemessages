import { Extra, Markup, BaseScene, Stage } from 'telegraf';
import { MenuTemplate } from 'telegraf-inline-menu';
import { TContextWithState } from '../../utils/interfaces';
import { sellMsgHasValue } from '../../utils/util';
import { UserServices } from '../../database/services';
import { i18n } from '../../app';

const service = new UserServices();

// Menu functions

async function toggleNotifications(ctx: TContextWithState) {
  if (ctx.callbackQuery && ctx.callbackQuery.from) {
    const user = await service.getUserFromId(ctx.callbackQuery.from.id);

    if (user.response && user.payload) {
      const notif = user.payload['notifications'] === 1 ? true : false;
      const change = await service.setNotifications(parseInt(user.payload['user_id']), !notif);

      if (change.response) {
        return notif;
      } else {
        throw new Error('Não foi possível alterar configuração de notificação do user');
      }
    } else {
      throw new Error('Não foi possível obter user payload');
    }
  }
}

async function getNotifications(ctx: TContextWithState) {
  if (ctx.callbackQuery && ctx.callbackQuery.from) {
    const user = await service.getUserFromId(ctx.callbackQuery.from.id);

    if (user.response && user.payload) {
      const notif = user.payload['notifications'] === 1 ? true : false;
      return notif;
    } else {
      throw new Error('Não foi possível obter user payload');
    }
  }
}

async function getHeaderMessage(ctx: TContextWithState) {
  if (ctx.callbackQuery && ctx.callbackQuery.from) {
    const user = await service.getUserFromId(ctx.callbackQuery.from.id);

    if (user.response && user.payload) {
      return user.payload['sell_msg']
    } else {
      throw new Error('Não foi possível obter user payload');
    }
  }
}

async function setHeaderMessage(user_id: number, message: string) {
  const has = sellMsgHasValue(message);

  if (has) {
    const user = await service.getUserFromId(user_id);

    if (user.response && user.payload) {
      const set = await service.setSellMessage(user_id, message);

      return (set.response) ? true : new Error('Não foi possível alterar a mensagem');
    } else {
      throw new Error('Não foi possível obter user payload');
    }
  } else {
    return false;
  }
}

async function getPayOnce(user_id: number) {
  const user = await service.getUserFromId(user_id);

  if (user.response && user.payload) {
    return user.payload['pay_once'] === 1 ? true : false;
  } else {
    throw new Error('Não foi possível obter user payload');
  }
}

async function setPayOnce(user_id: number, state: boolean) {
  const user = await service.getUserFromId(user_id);

  if (user.response && user.payload) {
    const set = await service.setPayOnce(user_id, state);

    if (set.response) {
      return true;
    } else {
      return false;
    }
  } else {
    throw new Error('Não foi possível obter user payload');
  }
}

async function setLanguage(user_id: number, language: string) {
  const user = await service.getUserFromId(user_id);

  if (user.response && user.payload) {
    return await service.setUserLanguage(user_id, language);
  } else {
    return false;
  }
}

// Menus

export const mainMenu = new MenuTemplate<TContextWithState>((ctx) => {
  return ctx.i18n.t('commands.settings.settings_body');
});

// Notifications Submenu
const notificationSubmenu = new MenuTemplate<TContextWithState>(ctx => {
  return ctx.i18n.t('commands.settings.notifications.body');
});

notificationSubmenu.toggle((ctx) => ctx.i18n.t('commands.settings.notifications.toggle_button'), 'notifications', {
  set: async (ctx) => {
    const notif = await toggleNotifications(ctx);
    console.log(notif);
    return true;
  },
  isSet: async (ctx) => await getNotifications(ctx) as boolean,
});

notificationSubmenu.navigate((ctx) => ctx.i18n.t('common.back_button'), '..');

mainMenu.submenu((ctx) => ctx.i18n.t('commands.settings.notifications.button'), 'notifications', notificationSubmenu);

// Header Message Submenu

const headermsgSubmenu = new MenuTemplate<TContextWithState>(
  async ctx => {
    return {
      text: ctx.i18n.t('commands.settings.header.body', { message: await getHeaderMessage(ctx) }),
      parse_mode: 'HTML'
    }
  }
);

// Header Message Question

export const headermsgQuestion = new BaseScene<TContextWithState>('cngheader');

headermsgQuestion.enter(ctx => {
  ctx.replyWithMarkdown(ctx.i18n.t('commands.settings.header.new.body'),
    Extra.HTML().markup(Markup.forceReply())
  );
});

headermsgQuestion.on('message', async (ctx) => {
  if (ctx.message && ctx.message.text && ctx.message.from) {
    const set = await setHeaderMessage(ctx.message.from.id, ctx.message.text);

    if (set) {
      ctx.reply(ctx.i18n.t('commands.settings.header.change.saved'));
      ctx.scene.leave();
    } else {
      ctx.reply(ctx.i18n.t('commands.settings.header.change.need_value_var'), { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id });
    }
  } else {
    return false;
  }
});

headermsgSubmenu.interact((ctx) => ctx.i18n.t('commands.settings.header.change.button'), 'cngheader', {
  do: async (ctx) => {
    ctx.scene.enter('cngheader');
    ctx.answerCbQuery();
    return false;
  }
});

headermsgSubmenu.interact((ctx) => ctx.i18n.t('commands.settings.header.reset.button'), 'resetheader', {
  do: async ctx => {
    if (ctx.callbackQuery && ctx.callbackQuery.from) {
      const set = await setHeaderMessage(ctx.callbackQuery.from.id, ctx.i18n.t('commands.settings.header.reset.template'));

      if (set) {
        ctx.answerCbQuery(ctx.i18n.t('commands.settings.header.reset.success'));
        return true;
      } else {
        ctx.answerCbQuery(ctx.i18n.t('common.generic_error'));
        return false;
      }
    } else {
      return false;
    }
  },
  joinLastRow: true
});

headermsgSubmenu.navigate((ctx) => ctx.i18n.t('common.back_button'), '..');

mainMenu.submenu((ctx) => ctx.i18n.t('commands.settings.header.button'), 'headermsg', headermsgSubmenu, { joinLastRow: true });

const payonceSubmenu = new MenuTemplate<TContextWithState>(ctx => ctx.i18n.t('commands.settings.payment.body'));

const paytypes: Record<string, string> = {
  true: 'Compra única',
  false: 'Compra recorrente'
}

payonceSubmenu.select('pmts', paytypes, {
  set: async (ctx, key) => {
    if (ctx.callbackQuery && ctx.callbackQuery.from) {
      const set = await setPayOnce(ctx.callbackQuery.from.id, JSON.parse(key));

      console.log(set, key);


      if (set) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  },
  isSet: async (ctx, key) => {
    if (ctx.callbackQuery && ctx.callbackQuery.from) {
      const isPayOnce = await getPayOnce(ctx.callbackQuery.from.id);
      console.log('ispayonce', isPayOnce);


      if (isPayOnce === JSON.parse(key)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  buttonText: (ctx, key) => {
    return ctx.i18n.t(`commands.settings.payment.${JSON.parse(key) === true ? 'single_payment' : 'multiple_payment'}`)
  }
});

payonceSubmenu.navigate((ctx) => ctx.i18n.t('common.back_button'), '..');

mainMenu.submenu((ctx) => ctx.i18n.t('commands.settings.payment.button'), 'payments', payonceSubmenu);

const languageSubmenu = new MenuTemplate<TContextWithState>(ctx => ctx.i18n.t('commands.settings.language.body'));

const languages: Record<string, any> = {
  ptBR: 'pt-BR',
  enUS: 'en-US',
}

languageSubmenu.choose('lang', languages, {
  do: async (ctx, key) => {
    if (ctx.callbackQuery && ctx.callbackQuery.from) {
      const set = await setLanguage(ctx.callbackQuery.from.id, languages[key]);
      if (set) {
        ctx.answerCbQuery(ctx.i18n.t('commands.settings.language.success'));
        return '..';
      } else {
        ctx.answerCbQuery(ctx.i18n.t('common.generic_error'));
        return '..';
      }
    } else {
      return false;
    }
  },
  buttonText: (ctx, key) => {
    return ctx.i18n.t(`language.list.${key}`);
  },
  columns: 2,
  maxRows: 4
});

languageSubmenu.navigate((ctx) => ctx.i18n.t('common.back_button'), '..');

mainMenu.submenu((ctx) => ctx.i18n.t('commands.settings.language.button'), 'language', languageSubmenu, {
  joinLastRow: true
});