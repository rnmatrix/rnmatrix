import chats from './chat';
import matrix from './matrix';
import messages from './message';
import users from './user';
import auth from './auth';
import DeviceListener from '../react-sdk-utils/DeviceListener';

const debug = require('debug')('rnm:services:external.js');

class RnMatrix {
  /*************************************************
   * CLIENT METHODS
   *************************************************/

  async createClient(baseUrl, accessToken, userId, deviceId) {
    return matrix.createClient(baseUrl, accessToken, userId, deviceId);
  }

  async start(useCrypto) {
    await matrix.start(useCrypto);
    DeviceListener.makeShared().start();
  }

  async getHomeserverData(domain) {
    return matrix.getHomeserverData(domain);
  }

  getClient() {
    return matrix.getClient();
  }

  /*************************************************
   * AUTH METHODS
   *************************************************/

  initAuth() {
    return auth.init();
  }

  loginWithPassword(username, password, homeserver, initCrypto = false, deviceName = undefined) {
    return auth.loginWithPassword(username, password, homeserver, initCrypto, deviceName = undefined);
  }

  logout() {
    return auth.logout();
  }

  /*************************************************
   * USER METHODS
   *************************************************/

  getMyUser() {
    return matrix.getClient().getUser(matrix.getClient().getUserId());
  }

  /*************************************************
   * ROOM METHODS
   *************************************************/

  // async createRoom(options = {}) {
  //   const defaults = {
  //     visibility: 'private',
  //     invite: [], // list of user IDs
  //     room_topic: '',
  //   };
  //   return chats.createChat({ ...defaults, ...options });
  // }

  // async createEncryptedRoom(usersToInvite) {
    // return chats.createEncryptedChat(usersToInvite);
  // }

  // getRooms$(slim = false) {
    // return chats.getChats(slim);
  // }

  // getRoomsByType$(type) {
    // return chats.getListByType$(type);
  // }

  // getRoomById(roomId) {
    // return chats.getChatById(roomId);
  // }

  // joinRoom(roomIdOrAlias) {
    // chats.joinRoom(roomIdOrAlias);
  // }

  // leaveRoom(roomId) {
    // chats.leaveRoom(roomId);
  // }

  // rejectInvite(roomId) {
    // chats.leaveRoom(roomId);
  // }

  // getDirectChat(userId) {
    // let directMessage = null;
    // const joinedChats = chats.getChats(false).getValue();
    // for (let i = 0; i < joinedChats.length && !directMessage; i++) {
    //   const chat = joinedChats[i];
    //   const members = chat.getMembers();
    //   const hasUser = members.find((member) => member.id === userId);
    //   if (members.length === 2 && hasUser) {
    //     directMessage = chat;
    //   }
    // }
    // return directMessage;
  // }

  // setRoomName(roomId, name) {
    // const chat = chats.getChatById(roomId);
    // chat.setName(name);
  // }

  async markAsRead(room) {
    await chats.markAsRead(room)
  }

  /*************************************************
   * MESSAGE METHODS
   *************************************************/

  send(content, type: string, roomId: string, eventId = null) {
    messages.send(content, type, roomId, eventId);
  }

  sendTextMessage(roomId: string, content: string) {
    messages.sendTextMessage(roomId, content)
  }

  sendMediaMessage(roomId: string, content, type: 'm.image' | 'm.video') {
    messages.sendMediaMessage(roomId, content, type)
  }

  sendReply(roomId, relatedMessage, messageText) {
    messages.sendReply(roomId, relatedMessage, messageText);
  }

  // getMessageById(eventId, roomId, event = null) {
    // return messages.getMessageById(eventId, roomId, event);
  // }

  deleteMessage(event) {
    const eventId = event.getId();
    const roomId = event.getRoomId();
    matrix.getClient().redactEvent(roomId, eventId);
  }

  editMessage(roomId, messageId, newMessageContent) {
    messages.send(newMessageContent, 'm.edit', roomId, messageId);
  }

  /*************************************************
   * User Methods
   *************************************************/

  getKnownUsers() {
    return users.getKnownUsers();
  }

  async searchUsers(searchTerm) {
    return await users.searchUsers(searchTerm);
  }

  getUserById(userId) {
    return users.getUserById(userId);
  }

  /*************************************************
   * HELPERS
   *************************************************/

  getHttpUrl(mxcUrl, width = null, height = null, resizeMethod = 'scale') {
    return matrix.getHttpUrl(mxcUrl, width, height, resizeMethod);
  }
}

const rnm = new RnMatrix();
export default rnm;
