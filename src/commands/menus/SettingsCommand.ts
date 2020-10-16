import { Extra, Markup, BaseScene, Stage } from 'telegraf';
import { MenuTemplate } from 'telegraf-inline-menu';
import { TContextWithState } from '../../utils/interfaces';
import { sellMsgHasValue } from '../../utils/util';
import { UserServices } from '../../database/services';

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

// Menus

export const mainMenu = new MenuTemplate<TContextWithState>((ctx) => {
  return 'Painel de configurações\n\nUse os botões abaixo para alterar as configurações do bot.'
});

// Notifications Submenu
const notificationSubmenu = new MenuTemplate<TContextWithState>(ctx => '🔔 Notificações:\n\nDefina se você quer receber notificações do bot quando alguém comprar uma mensagem sua.');

notificationSubmenu.toggle('Notificações', 'notifications', {
  set: async (ctx) => {
    const notif = await toggleNotifications(ctx);
    console.log(notif);
    return true;
  },
  isSet: async (ctx) => await getNotifications(ctx) as boolean,
});

notificationSubmenu.navigate('Voltar', '..');

mainMenu.submenu('🔔 Notificações', 'notifications', notificationSubmenu);

// Header Message Submenu

const headermsgSubmenu = new MenuTemplate<TContextWithState>(
  async ctx => {
    return {
      text: '💬 Cabeçalho da Mensagem:\n\nAqui você pode escrever um cabeçalho customizado para aparecer nas suas mensagens pagas\\. ' +
        'Para saber mais sobre, você pode usar o comando `/help header`\\.\n\n' +
        'A sua mensagem atual é:\n' +
        `_${await getHeaderMessage(ctx)}_`,
      parse_mode: 'Markdown'
    }
  }
);

// Header Message Question

export const headermsgQuestion = new BaseScene<TContextWithState>('cngheader');

headermsgQuestion.enter(ctx => {
  ctx.replyWithMarkdown(
    'Digite a nova mensagem para usar de cabeçalho. As seguintes variáveis estão disponíveis (markdown disponível):\n\n' +
    '`$value (obrigatório)` - Mostra o valor da mensagem a ser vendida.\n' +
    '`$totalamount` - Mostra o seu saldo total.\n' +
    '`$firstname` - Mostra o seu primeiro nome.\n' +
    '`$username` - Mostra seu nome de usuário.\n\n' +
    'Você pode cancelar esse comando à qualquer momento usando /cancel',
    Extra.markdown().markup(Markup.forceReply())
  );
});

headermsgQuestion.on('message', async (ctx) => {
  if (ctx.message && ctx.message.text && ctx.message.from) {
    const set = await setHeaderMessage(ctx.message.from.id, ctx.message.text);

    if (set) {
      ctx.scene.leave();
      ctx.reply('Cabeçalho salvo com sucesso.');
    } else {
      ctx.reply('Sua mensagem precisa conter a variável `$value`.', { parse_mode: 'Markdown', reply_to_message_id: ctx.message.message_id });
    }
  } else {
    return false;
  }
});

headermsgSubmenu.interact('✏️ Alterar cabeçalho', 'cngheader', {
  do: async (ctx) => {
    ctx.scene.enter('cngheader');
    ctx.answerCbQuery();
    return false;
  }
});

headermsgSubmenu.interact('↩️ Voltar ao padrão', 'resetheader', {
  do: async ctx => {
    if (ctx.callbackQuery && ctx.callbackQuery.from) {
      const set = await setHeaderMessage(ctx.callbackQuery.from.id, '*$firstname* está vendendo uma mensagem por *$valuec*');

      if (set) {
        ctx.answerCbQuery('Você redefiniu a mensagem para o padrão.');
        return true;
      } else {
        ctx.answerCbQuery('Ocorreu um erro.');
        return false;
      }
    } else {
      return false;
    }
  },
  joinLastRow: true
});

headermsgSubmenu.navigate('Voltar', '..');

mainMenu.submenu('💬 Cabeçalho', 'headermsg', headermsgSubmenu, { joinLastRow: true });

const payonceSubmenu = new MenuTemplate<TContextWithState>(ctx => '💵 Pagamento Único:\n\nDefina se você quer que suas mensagens sejam cobradas apenas uma vez por usuário ou se eles deverão pagar sempre que comprarem a mesma mensagem.');

const paytypes: Record<string, string> = {
  true: 'Compra única',
  false: 'Compra recorrente'
}

payonceSubmenu.select('pmts', paytypes, {
  set: async (ctx, key) => {
    if (ctx.callbackQuery && ctx.callbackQuery.from) {
      const set = await setPayOnce(ctx.callbackQuery.from.id, JSON.parse(key));

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

      if (isPayOnce === JSON.parse(key)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
});

payonceSubmenu.navigate('Voltar', '..');

mainMenu.submenu('💵 Pagamentos', 'payments', payonceSubmenu);