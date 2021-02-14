import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { matrix } from '../../../../index';

export default function Reactions({ room, event, isMe }) {
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
    const newReactions = room
      .getUnfilteredTimelineSet()
      .getRelationsForEvent(eventId, 'm.annotation', 'm.reaction');
    if (reactions !== newReactions) {
      setReactions(newReactions);
    }
  };

  const renderReactions = useCallback(() => {
    if (!reactions) return null;
    return reactions
      .getSortedAnnotationsByKey()
      .map(([content, events]) => {
        const count = events.size;
        if (!count) {
          return null;
        }
        const userId = matrix.getClient().getUserId();
        const myReactions = reactions.getAnnotationsBySender()[userId];
        const myReactionEvent =
          myReactions &&
          [...myReactions.values()].find((mxEvent) => {
            if (mxEvent.isRedacted()) {
              return false;
            }
            return mxEvent.getRelation().key === content;
          });
        return (
          <ReactionBubble
            key={content}
            content={content}
            count={count}
            isMe={isMe}
            isMyReaction={!!myReactionEvent}
          />
        );
      })
      .filter((item) => !!item);
  }, [reactions]);

  useEffect(() => {
    if (event) {
      getReactions();
    }
  }, [event]);

  return reactions ? (
    <View
      style={{
        flexDirection: `row${isMe ? '-reverse' : ''}`,
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 12,
      }}>
      {renderReactions()}
    </View>
  ) : null;
}

// TODO for toggling the reaction 
// onClick = (ev) => {
//   const { mxEvent, myReactionEvent, content } = this.props;
//   if (myReactionEvent) {
//       MatrixClientPeg.get().redactEvent(
//           mxEvent.getRoomId(),
//           myReactionEvent.getId(),
//       );
//   } else {
//       MatrixClientPeg.get().sendEvent(mxEvent.getRoomId(), "m.reaction", {
//           "m.relates_to": {
//               "rel_type": "m.annotation",
//               "event_id": mxEvent.getId(),
//               "key": content,
//           },
//       });
//       dis.dispatch({action: "message_sent"});
//   }
// };

function ReactionBubble({ content, count, isMe, isMyReaction }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: isMyReaction ? 'blue' : '#ccc',
        backgroundColor: isMyReaction ? 'dodgerblue' : '#ccc',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 20,
        marginLeft: isMe ? 6 : 0,
        marginRight: isMe ? 0 : 6,
      }}>
      <Text style={{ fontSize: 22, marginRight: 4 }}>{content}</Text>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>{count}</Text>
    </View>
  );
}
