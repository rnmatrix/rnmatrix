import { EventStatus } from 'matrix-js-sdk';

// This is to add our own statuses on top of matrix's
export const MessageStatus = {
  ...EventStatus,
  // The content of the message (file) is uploading
  UPLOADING: 'uploading',
  // The content of the message could not be uploaded
  NOT_UPLOADED: 'not_uploaded',
};