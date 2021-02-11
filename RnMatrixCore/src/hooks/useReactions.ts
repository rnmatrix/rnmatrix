import { useEffect, useState } from 'react';
import { matrix } from '../../index';

export default function useReactions(event) {
  const [reactions, setReactions] = useState(undefined);

  const getReactions = () => {
    const eventId = event.getId();
    if (!eventId) {
      // XXX: Temporary diagnostic logging for https://github.com/vector-im/element-web/issues/11120
      console.error('EventTile attempted to get relations for an event without an ID');
      // Use event's special `toJSON` method to log key data.
      console.log(JSON.stringify(this.props.mxEvent, null, 4));
      console.trace('Stacktrace for https://github.com/vector-im/element-web/issues/11120');
    }
    const room = matrix.getRoomById(event.getRoomId())
    const newReactions = room._matrixRoom
      .getUnfilteredTimelineSet()
      .getRelationsForEvent(eventId, 'm.annotation', 'm.reaction');
    if (reactions !== newReactions) {
      formatReactions(newReactions)
    }
  };

  const formatReactions = (reactionList) => {
    const formatted = reactionList
      .getSortedAnnotationsByKey()
      .map(([content, events]) => {
        const count = events.size;
        if (!count) {
          return null;
        }
        const userId = matrix.getClient().getUserId();
        const myReactions = reactionList.getAnnotationsBySender()[userId];
        const myReactionEvent =
          myReactions &&
          [...myReactions.values()].find((mxEvent) => {
            if (mxEvent.isRedacted()) {
              return false;
            }
            return mxEvent.getRelation().key === content;
          });

          return {
            emojiKey: content,
            count,
            isMyReaction: !!myReactionEvent
          }
      })
      .filter((item) => !!item);
      setReactions(formatted)
  }

  useEffect(() => {
    if (event) {
      getReactions();
    }
  }, [event]);

  return reactions;
}
