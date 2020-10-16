import GroupsController from '../controllers/GroupsController';
import { Group } from '../../utils/interfaces';
import { createResponse } from '../../utils/util';

const Controller = new GroupsController();

export default class GroupServices {
  async getAllGroups() {
    const groups = await Controller.index();

    return (groups) ?
      createResponse("200", groups) :
      createResponse("404");
  }

  async getGroupFromId(chat_id: number) {
    const group = await Controller.index(chat_id);

    return (group) ?
      createResponse("200", group) :
      createResponse("404");
  }

  async addGroup(chat: Partial<Group>) {
    const exists = await Controller.index(chat.chat_id);

    if (exists) {
      return createResponse("409");
    } else {
      const insert = await Controller.create(chat);

      return (insert) ?
        createResponse("201") :
        createResponse("406");
    }
  }
}