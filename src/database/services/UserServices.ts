import UsersController from '../controllers/UsersController';
import { IJWTData, User } from '../../utils/interfaces';
import { createResponse } from '../../utils/util';

const Controller = new UsersController();

export default class UserServices {
  async getAllUsers() {
    const users = await Controller.index();

    return (users) ?
      createResponse("200", users) :
      createResponse("404");
  }

  async getUserFromId(user_id: number) {
    const user = await Controller.index(user_id);

    return (user) ?
      createResponse("200", user) :
      createResponse("404");
  }

  async getUserFromUsername(username: string) {
    const user = await Controller.index(username);

    return (user) ?
      createResponse("200", user) :
      createResponse("404");
  }

  async createUserIfNew(user: Partial<User>) {
    const exists = await Controller.index(user.user_id);

    if (!exists) {
      const create = await Controller.create(user);

      return (create) ?
        createResponse("201") :
        createResponse("406");
    } else {
      return createResponse("409");
    }
  }

  async userExists(user_id: number) {
    const user = await Controller.index(user_id);

    return (user) ?
      createResponse("200", true) :
      createResponse("200", false);
  }

  async userIsAdmin(user_id: number) {
    const user = await Controller.index(user_id);

    if (user) {
      return (user['is_admin'] === true || user['is_admin'] === 1) ?
        createResponse("200", true) :
        createResponse("200", false);
    } else {
      return createResponse("404");
    }
  }

  async userIsBanned(user_id: number) {
    const user = await Controller.index(user_id);

    if (user) {
      return (user['is_banned'] === true || user['is_banned'] === 1) ?
        createResponse("200", true) :
        createResponse("200", false);
    } else {
      return createResponse("404");
    }
  }

  async deleteUser(user_id: number) {
    const user = await this.getUserFromId(user_id);

    if (user) {
      const del = await Controller.delete(user_id);

      return (del) ?
        createResponse("230") :
        createResponse("406");
    } else {
      return createResponse("404");
    }
  }

  async banUser(user_id: number) {
    const user = await Controller.index(user_id);

    if (user) {
      const ban = await Controller.update(user_id, {
        is_banned: true
      });

      return (ban) ?
        createResponse("200") :
        createResponse("406");
    } else {
      return createResponse("404");
    }
  }

  async getSellMessage(user_id: number) {
    const user: User = await Controller.index(user_id);

    if (user) {
      return (user.sell_msg) ?
        createResponse("200", user.sell_msg) :
        createResponse("406");
    } else {
      return createResponse("404");
    }
  }

  async setSellMessage(user_id: number, sell_msg: string) {
    const user: User = await Controller.index(user_id);

    if (user) {
      const set = await Controller.update(user_id, {
        sell_msg
      });

      return (set) ?
        createResponse("200") :
        createResponse("406");
    } else {
      return createResponse("404");
    }
  }

  async getPayOnce(user_id: number) {
    const user: User = await Controller.index(user_id);

    if (user) {
      return (user.pay_once) ?
        createResponse("200", true) :
        createResponse("200", false);
    } else {
      return createResponse("404");
    }
  }

  async setPayOnce(user_id: number, state: boolean) {
    const user: User = await Controller.index(user_id);

    if (user) {
      const set = await Controller.update(user_id, {
        pay_once: state
      });

      return (set) ?
        createResponse("200") :
        createResponse("409");
    } else {
      return createResponse("404");
    }
  }

  // Balance methods
  async getBalance(user_id: number) {
    const user: User = await Controller.index(user_id);

    if (user) {
      return (user.coins || user.coins === 0) ?
        createResponse("200", user.coins) :
        createResponse("406");
    } else {
      return createResponse("404");
    }
  }

  async userCanTransact(user_id: number, value: number) {
    const user: User = await Controller.index(user_id);

    if (user) {
      return createResponse("200", user.coins >= value);
    } else {
      return createResponse("404");
    }
  }


  async setBalance(user_id: number, value: number) {
    const user: User = await Controller.index(user_id);

    if (user) {
      if (!(value < 0)) {
        const change = await Controller.update(user_id, {
          coins: value
        });

        return (change) ?
          createResponse("200") :
          createResponse("406");
      } else {
        return createResponse("409")
      }
    } else {
      return createResponse("404");
    }
  }

  async addAmount(user_id: number, value: number) {
    const user: User = await Controller.index(user_id);

    if (user) {
      const change = await this.setBalance(user_id, (user.coins + value));

      return (change.response) ?
        createResponse("200") :
        createResponse(change.response_code!, change.payload);
    } else {
      return createResponse("404");
    }
  }

  async subtractAmount(user_id: number, value: number) {
    const user: User = await Controller.index(user_id);

    if (user) {
      const change = await this.setBalance(user_id, (user.coins - value));

      return (change.response) ?
        createResponse("200") :
        createResponse(change.response_code!, change.payload);
    } else {
      return createResponse("404");
    }
  }

  async makeTransaction(buyer_id: number, seller_id: number, value: number) {
    const buyer: User = await Controller.index(buyer_id);

    if (buyer.coins > value && value > 0) {
      const trx1 = await this.subtractAmount(buyer_id, value);
      const trx2 = await this.addAmount(seller_id, value);

      if (trx1.response && trx2.response) {
        return createResponse("200", "A transação foi feita com sucesso.");
      } else {
        return createResponse("406");
      }
    } else {
      return createResponse("409");
    }
  }

  // Settings
  async setNotifications(user_id: number, state: boolean) {
    const user = await Controller.index(user_id);

    if (user) {
      const change = await Controller.update(user_id, {
        notifications: state
      });

      return (change) ?
        createResponse("200") :
        createResponse("406");
    } else {
      return createResponse("404");
    }
  }

  async mergeData(user_id: number, data: Partial<IJWTData>) {
    const user = await Controller.index(user_id);

    if (user) {
      const merge = await Controller.update(user_id, {
        coins: data.coins,
        is_admin: data.is_admin,
        sell_msg: data.sell_msg
      });

      return (merge) ?
        createResponse("200") :
        createResponse("406");
    } else {
      return createResponse("404");
    }
  }
}