type SenderUserId = string;

interface MatrixEvent {
  getId: () => string;
  getSender: () => SenderUserId;
  getType: () => string; // todo clarify these types
  getRoomId: () => string;
  getTs: () => Number; 
  getDate: () => Date;
  getOriginalContent: () => Object;
  getContent: () => Object;
  getStateKey: () => string;
  isState: () => boolean;
  isBeingDecrypted: () => boolean;
  isDecryptionFailure: () => boolean;
  isEncrypted: () => boolean;
  isRedacted: () => boolean;
  isRedaction: () => boolean;
  isSending: () => boolean;
  isRelation: (relationType?: string) => boolean;
  getRelation: () => Object;
  getAssociatedId: () => string;
  hasAssociation: () => boolean;
}

export default MatrixEvent;