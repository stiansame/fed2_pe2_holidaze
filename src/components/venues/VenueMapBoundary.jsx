import { Component, lazy, Suspense } from "react";
import { messages } from "../../constants/messages.js";
import Loading from "../Loading.jsx";

const VenueLocationMap = lazy(() => import("./VenueLocationMap.jsx"));

/** Loads the venue map and keeps a map failure local to its panel. */
export default class VenueMapBoundary extends Component {
  state = { failed: false };

  /** Switches to the fallback if the map fails to load or render. */
  static getDerivedStateFromError() {
    return { failed: true };
  }

  /** Shows the map, its loading indicator or a message with the available alternative. */
  render() {
    if (this.state.failed) {
      return (
        <p role="status" className="text-small text-muted">
          {messages.mapLoadFailed}
          {this.props.onChange && messages.mapManualCoordinates}
        </p>
      );
    }
    return (
      <Suspense fallback={<Loading>Loading map…</Loading>}>
        <VenueLocationMap {...this.props} />
      </Suspense>
    );
  }
}
