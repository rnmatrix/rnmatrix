import loglevel from 'loglevel';
import matrixSdk, { EventTimeline } from 'matrix-js-sdk';
import { BehaviorSubject } from 'rxjs';
import chats from './chat';
import matrix from './matrix';

const debug = require('debug')('rnm:services:external.js');

class ExternalService {
  async createClient(baseUrl, accessToken, userId) {
    return matrix.createClient(baseUrl, accessToken, userId);
  }

  async start() {
    return matrix.start();
  }

  deleteMessage(message) {
    const { event } = message.getMatrixEvent();
    const eventId = event.event_id;
    const roomId = event.room_id;
    matrix.getClient().redactEvent(roomId, eventId);
    message.update();
  }

  async createRoom(options = {}) {
    const defaults = {
      visibility: 'private',
      invite: [], // list of user IDs
      name: 'New Room', // string for room name
      room_topic: '',
    };
    return chats.createChat({ ...defaults, ...options });
  }
}

const external = new ExternalService();
export default external;
