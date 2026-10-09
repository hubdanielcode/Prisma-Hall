import { EventListItem } from "./EventListItem";
import { fakeEvent } from "../../../../../.storybook/mocks/hooks/events/useEvents";
import { fn } from "storybook/test";

export default {
  title: "Layouts/Public/Schedule/Events",
  component: EventListItem,
  parameters: {
    layout: "fullscreen",
  },
};

const ListItem = () => {
  return (
    <div className="w-150">
      <EventListItem
        event={fakeEvent}
        onSelect={fn()}
      />
    </div>
  );
};

export { ListItem as "Event List Item" };
