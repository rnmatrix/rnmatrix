import { null } from 'is';
import React from 'react';
import { Text, View } from 'react-native';

export default function Reactions({ room, event }) {
  const getReactions = () => {
    const eventId = event.getId();
    if (!eventId) {
      // XXX: Temporary diagnostic logging for https://github.com/vector-im/element-web/issues/11120
      console.error('EventTile attempted to get relations for an event without an ID');
      // Use event's special `toJSON` method to log key data.
      console.log(JSON.stringify(this.props.mxEvent, null, 4));
      console.trace('Stacktrace for https://github.com/vector-im/element-web/issues/11120');
    }
    return room._matrixRoom
      .getUnfilteredTimelineSet()
      .getRelationsForEvent(eventId, 'm.annotation', 'm.reaction');
  };

  const reactions = getReactions();
  if (reactions) {
    console.log(reactions.getRelations());
  } else {
    return null
  }

  let items = reactions.getSortedAnnotationsByKey().map(([content, events]) => {
    const count = events.size;
    if (!count) {
        return null;
    }
    // const myReactionEvent = myReactions && myReactions.find(mxEvent => {
    //     if (mxEvent.isRedacted()) {
    //         return false;
    //     }
    //     return mxEvent.getRelation().key === content;
    // });
    return <Text>{content} {count}</Text>
    // return <ReactionsRowButton
    //     key={content}
    //     content={content}
    //     count={count}
    //     mxEvent={mxEvent}
    //     reactionEvents={events}
    //     myReactionEvent={myReactionEvent}
    // />;
}).filter(item => !!item);

console.log({items})


return null

  return reactions ? (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {reactions.getRelations().map((e) => (
        <ReactionBubble event={e} />
      ))}
    </View>
  ) : null;
}

function ReactionBubble({ event }) {
  return <Text>{event.getContent()['m.relates_to'].key}</Text>;
}
